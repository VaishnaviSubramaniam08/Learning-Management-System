import React, { useState, useEffect } from 'react';
import axios from '../api';

const BookMaterials = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const searchBooks = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
      const data = await response.json();
      
      if (data.items) {
        setBooks(data.items.map(item => ({
          id: item.id,
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors || ['Unknown Author'],
          description: item.volumeInfo.description || 'No description available',
          imageUrl: item.volumeInfo.imageLinks?.thumbnail || null,
          publishedDate: item.volumeInfo.publishedDate,
          pageCount: item.volumeInfo.pageCount,
          categories: item.volumeInfo.categories || [],
          previewLink: item.volumeInfo.previewLink,
          averageRating: item.volumeInfo.averageRating,
          ratingsCount: item.volumeInfo.ratingsCount
        })));
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error('Error searching books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchBooks(searchQuery);
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
  };

  const closeBookDetails = () => {
    setSelectedBook(null);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '28px' }}>
          📚 Book Materials
        </h2>
        <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>
          Search and explore educational books to supplement your learning.
        </p>
      </div>

      {/* Search Form */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for books, authors, or subjects..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#6b46c1',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            {loading ? '🔍 Searching...' : '🔍 Search'}
          </button>
        </form>
      </div>

      {/* Books Grid */}
      {books.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {books.map(book => (
            <div
              key={book.id}
              onClick={() => handleBookClick(book)}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                ':hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}
            >
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    style={{
                      width: '80px',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '80px',
                    height: '120px',
                    background: '#f3f4f6',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}>
                    No Image
                  </div>
                )}
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    color: '#374151', 
                    fontSize: '16px',
                    fontWeight: '600',
                    lineHeight: '1.3'
                  }}>
                    {book.title}
                  </h3>
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    color: '#6b7280', 
                    fontSize: '14px' 
                  }}>
                    by {book.authors.join(', ')}
                  </p>
                  {book.averageRating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#f59e0b' }}>⭐</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        {book.averageRating.toFixed(1)} ({book.ratingsCount} ratings)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <p style={{ 
                color: '#6b7280', 
                fontSize: '14px', 
                lineHeight: '1.4',
                margin: '0 0 12px 0',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {book.description}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#9ca3af' 
                }}>
                  {book.pageCount ? `${book.pageCount} pages` : 'Unknown pages'}
                </span>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#9ca3af' 
                }}>
                  {book.publishedDate ? new Date(book.publishedDate).getFullYear() : 'Unknown year'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && books.length === 0 && searchQuery && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>No books found</h3>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Try searching with different keywords or check your spelling.
          </p>
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: '#374151', fontSize: '24px' }}>{selectedBook.title}</h2>
              <button
                onClick={closeBookDetails}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
              {selectedBook.imageUrl ? (
                <img
                  src={selectedBook.imageUrl}
                  alt={selectedBook.title}
                  style={{
                    width: '120px',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
              ) : (
                <div style={{
                  width: '120px',
                  height: '180px',
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af'
                }}>
                  No Image
                </div>
              )}
              
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '16px' }}>
                  <strong>Authors:</strong> {selectedBook.authors.join(', ')}
                </p>
                <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '16px' }}>
                  <strong>Published:</strong> {selectedBook.publishedDate ? new Date(selectedBook.publishedDate).toLocaleDateString() : 'Unknown'}
                </p>
                <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '16px' }}>
                  <strong>Pages:</strong> {selectedBook.pageCount || 'Unknown'}
                </p>
                {selectedBook.averageRating && (
                  <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '16px' }}>
                    <strong>Rating:</strong> ⭐ {selectedBook.averageRating.toFixed(1)} ({selectedBook.ratingsCount} ratings)
                  </p>
                )}
                {selectedBook.categories.length > 0 && (
                  <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '16px' }}>
                    <strong>Categories:</strong> {selectedBook.categories.join(', ')}
                  </p>
                )}
              </div>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>Description</h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                {selectedBook.description}
              </p>
            </div>
            
            {selectedBook.previewLink && (
              <a
                href={selectedBook.previewLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#6b46c1',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  display: 'inline-block',
                  fontWeight: '500'
                }}
              >
                📖 Preview Book
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookMaterials; 