import { useEffect, useState } from 'react';

const coverColors = ['#b84235', '#873a45', '#bd7047', '#8d4a2d', '#a43b34', '#6f4a49'];

export default function BookCover({ book }) {
  const [imageFailed, setImageFailed] = useState(false);
  const colorSeed = Array.from(String(book.id || book.title || 'book'))
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  const coverColor = coverColors[colorSeed % coverColors.length];
  const isbn = book.isbn?.replace(/[^0-9Xx]/g, '');

  useEffect(() => setImageFailed(false), [isbn]);

  return (
    <div className="book-cover">
      {isbn && !imageFailed ? (
        <img
          src={`https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-L.jpg?default=false`}
          alt={`Cover of ${book.title}`}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="cover-placeholder" style={{ '--cover-color': coverColor }}>
          <span className="cover-mark">THE READING ROOM</span>
          <span className="cover-title">{book.title}</span>
          <span className="cover-author">{book.author}</span>
        </div>
      )}
    </div>
  );
}
