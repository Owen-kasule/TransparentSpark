import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  Calendar, 
  ArrowRight, 
  Eye, 
  Filter,
  Loader,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchPosts, getAllCategories, type BlogPost } from '../../data/blogData';

interface BlogSearchProps {
  onSearchResults?: (results: BlogPost[]) => void;
  className?: string;
}

interface SearchFilters {
  category: string;
  sortBy: 'relevance' | 'date' | 'views' | 'likes';
  timeRange: 'all' | 'week' | 'month' | 'year';
}

const BlogSearch: React.FC<BlogSearchProps> = ({ onSearchResults, className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [popularSearches] = useState(['React', 'TypeScript', 'CSS', 'Performance', 'Node.js']);
  
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    sortBy: 'relevance',
    timeRange: 'all'
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Load search history immediately but categories only when needed
    loadSearchHistory();
  }, []);

  useEffect(() => {
    // Load categories only when search is focused or filters are shown
    if (showResults || showFilters) {
      if (categories.length === 0) {
        loadCategories();
      }
    }
  }, [showResults, showFilters]);

  useEffect(() => {
    // Close search results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await getAllCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSearchHistory = () => {
    const history = localStorage.getItem('blog_search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  };

  const saveSearchHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('blog_search_history', JSON.stringify(newHistory));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('blog_search_history');
  };

  // Advanced search algorithm with fuzzy matching and relevance scoring
  const performAdvancedSearch = async (searchQuery: string): Promise<BlogPost[]> => {
    if (!searchQuery.trim()) return [];

    try {
      setIsSearching(true);
      
      // Get all posts first
      const allPosts = await searchPosts(searchQuery);
      
      // Advanced scoring algorithm
      const scoredResults = allPosts.map(post => {
        let score = 0;
        const queryLower = searchQuery.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
        
        // Title matching (highest weight)
        const titleLower = post.title.toLowerCase();
        if (titleLower.includes(queryLower)) score += 100;
        queryWords.forEach(word => {
          if (titleLower.includes(word)) score += 50;
        });
        
        // Exact title match bonus
        if (titleLower === queryLower) score += 200;
        
        // Category matching
        if (post.category.toLowerCase().includes(queryLower)) score += 80;
        
        // Tags matching
        post.tags.forEach(tag => {
          if (tag.toLowerCase().includes(queryLower)) score += 60;
          queryWords.forEach(word => {
            if (tag.toLowerCase().includes(word)) score += 30;
          });
        });
        
        // Excerpt matching
        const excerptLower = post.excerpt.toLowerCase();
        if (excerptLower.includes(queryLower)) score += 40;
        queryWords.forEach(word => {
          if (excerptLower.includes(word)) score += 20;
        });
        
        // Content matching (lower weight due to length)
        const contentLower = post.content.toLowerCase();
        if (contentLower.includes(queryLower)) score += 20;
        queryWords.forEach(word => {
          const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
          score += Math.min(matches * 5, 25); // Cap content score
        });
        
        // Popularity boost
        score += Math.log(post.views + 1) * 2;
        score += Math.log(post.likes + 1) * 3;
        
        // Recency boost
        const daysSincePublished = (Date.now() - new Date(post.date).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSincePublished < 30) score += 20;
        if (daysSincePublished < 7) score += 40;
        
        // Featured post boost
        if (post.featured) score += 30;
        
        return { ...post, searchScore: score };
      });

      // Filter and sort results
      let filteredResults = scoredResults.filter(post => post.searchScore > 0);
      
      // Apply category filter
      if (filters.category !== 'all') {
        filteredResults = filteredResults.filter(post => post.category === filters.category);
      }
      
      // Apply time range filter
      if (filters.timeRange !== 'all') {
        const now = new Date();
        const timeThresholds = {
          week: 7,
          month: 30,
          year: 365
        };
        
        const daysThreshold = timeThresholds[filters.timeRange as keyof typeof timeThresholds];
        filteredResults = filteredResults.filter(post => {
          const postDate = new Date(post.date);
          const daysDiff = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= daysThreshold;
        });
      }
      
      // Sort results
      filteredResults.sort((a, b) => {
        switch (filters.sortBy) {
          case 'date':
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case 'views':
            return b.views - a.views;
          case 'likes':
            return b.likes - a.likes;
          case 'relevance':
          default:
            return (b as any).searchScore - (a as any).searchScore;
        }
      });
      
      return filteredResults.slice(0, 20); // Limit to top 20 results
    } catch (error) {
      console.error('Search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const searchResults = await performAdvancedSearch(searchQuery);
    setResults(searchResults);
    setShowResults(true);
    
    if (onSearchResults) {
      onSearchResults(searchResults);
    }
    
    saveSearchHistory(searchQuery);
  };

  const debouncedSearch = (searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleQuickSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    handleSearch(searchTerm);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (query.trim()) {
      handleSearch(query);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-azure-400/30 text-azure-300 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const getSearchSuggestions = () => {
    if (query.trim()) return [];
    
    return [
      ...searchHistory.slice(0, 3),
      ...popularSearches.filter(search => !searchHistory.includes(search)).slice(0, 2)
    ];
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-white/60" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowResults(true)}
            placeholder="Search articles, topics, or keywords..."
            className="w-full pl-12 pr-20 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-azure-400 focus:bg-white/15 transition-all duration-300 text-lg"
          />
          
          <div className="absolute right-2 flex items-center space-x-2">
            {query && (
              <button
                onClick={clearSearch}
                className="p-2 text-white/60 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            )}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                showFilters 
                  ? 'text-azure-400 bg-azure-400/20' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Search Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 p-4 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl z-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-black/80 border border-white/20 rounded-lg text-white focus:outline-none focus:border-azure-400 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    <option value="all" className="bg-black text-white">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-black text-white">{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 bg-black/80 border border-white/20 rounded-lg text-white focus:outline-none focus:border-azure-400 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    <option value="relevance" className="bg-black text-white">Relevance</option>
                    <option value="date" className="bg-black text-white">Date</option>
                    <option value="views" className="bg-black text-white">Views</option>
                    <option value="likes" className="bg-black text-white">Likes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Time Range</label>
                  <select
                    value={filters.timeRange}
                    onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                    className="w-full px-3 py-2 bg-black/80 border border-white/20 rounded-lg text-white focus:outline-none focus:border-azure-400 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    <option value="all" className="bg-black text-white">All Time</option>
                    <option value="week" className="bg-black text-white">Past Week</option>
                    <option value="month" className="bg-black text-white">Past Month</option>
                    <option value="year" className="bg-black text-white">Past Year</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-40 max-h-96 overflow-hidden"
          >
            {/* Search Status */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isSearching ? (
                    <>
                      <Loader className="animate-spin text-azure-400" size={16} />
                      <span className="text-white/80 text-sm">Searching...</span>
                    </>
                  ) : query.trim() ? (
                    <>
                      <Search className="text-azure-400" size={16} />
                      <span className="text-white/80 text-sm">
                        {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="text-azure-400" size={16} />
                      <span className="text-white/80 text-sm">Quick searches</span>
                    </>
                  )}
                </div>
                
                {searchHistory.length > 0 && !query.trim() && (
                  <button
                    onClick={clearSearchHistory}
                    className="text-white/60 hover:text-white text-xs transition-colors duration-200"
                  >
                    Clear history
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {!query.trim() ? (
                /* Search Suggestions */
                <div className="p-4">
                  <div className="space-y-2">
                    {getSearchSuggestions().map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickSearch(suggestion)}
                        className="w-full text-left px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Search size={14} className="text-white/60" />
                        <span>{suggestion}</span>
                        {searchHistory.includes(suggestion) && (
                          <span className="text-white/40 text-xs ml-auto">Recent</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length > 0 ? (
                /* Search Results */
                <div className="p-2">
                  {results.map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.id}`}
                      onClick={() => setShowResults(false)}
                      className="block p-3 hover:bg-white/10 rounded-lg transition-colors duration-200 group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-16 h-12 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={post.image_url} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm line-clamp-1 group-hover:text-azure-400 transition-colors duration-200">
                            {highlightText(post.title, query)}
                          </h4>
                          
                          <p className="text-white/60 text-xs line-clamp-2 mt-1">
                            {highlightText(post.excerpt, query)}
                          </p>
                          
                          <div className="flex items-center space-x-4 mt-2 text-xs text-white/50">
                            <span className="px-2 py-1 bg-azure-400/20 text-azure-400 rounded-full">
                              {post.category}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Calendar size={10} />
                              <span>{new Date(post.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye size={10} />
                              <span>{post.views}</span>
                            </div>
                          </div>
                        </div>
                        
                        <ArrowRight size={16} className="text-white/40 group-hover:text-azure-400 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : !isSearching && query.trim() ? (
                /* No Results */
                <div className="p-8 text-center">
                  <BookOpen className="text-white/30 mx-auto mb-3" size={32} />
                  <p className="text-white/60 mb-2">No articles found for "{query}"</p>
                  <p className="text-white/40 text-sm">Try different keywords or browse our categories</p>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogSearch;