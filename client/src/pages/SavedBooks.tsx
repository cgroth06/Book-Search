// import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';

// import { getMe, deleteBook } from '../utils/API';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations'



const SavedBooks = () => {
  const { loading, error, data } = useQuery(GET_ME);

  const [deleteBook] = useMutation(REMOVE_BOOK);


  // Check if data is loading
  if (loading) return <h2>LOADING...</h2>;
  if (error) return <h2>Error: {error.message}</h2>;

  // Extract user data from the query result
  const userData = data?.me || {};

  // Handle delete book action
  const handleDeleteBook = async (bookId: string) => {
    try {
      const token = Auth.loggedIn() ? Auth.getToken() : null;

      if (!token) {
        return false;
      }

      // Execute the mutation and remove the book
      await deleteBook({
        variables: { bookId },
        update: (cache) => {
          const existingData: any = cache.readQuery({ query: GET_ME });
          const updatedBooks = existingData?.me?.savedBooks.filter(
            (book: any) => book.bookId !== bookId
          );

          cache.writeQuery({
            query: GET_ME,
            data: { me: { ...existingData.me, savedBooks: updatedBooks } },
          });
        },
      });

      // Remove the book's ID from local storage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'
            }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book: { bookId: string; image?: string; link?: string; title: string; authors: string[]; description: string; }) => {
            return (
              <Col md='4'>
                <Card key={book.bookId} border='dark'>
                  {book.image ? (
                    <Card.Img
                      src={book.link}
                      alt={`The cover for ${book.title}`}
                      variant='top'
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className='btn-block btn-danger'
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
