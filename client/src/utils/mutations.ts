import { gql } from '@apollo/client';

export const ADD_USER = gql`
  mutation addUser($input: AddUserInput!) {
    addUser(input: $input) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const ADD_BOOK = gql`
  mutation addBook($userId: ID!, $book: String!) {
    addBook(userId: $userId, book: $book) {
      _id
      username
      books
    }
  }
`;

export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

export const REMOVE_BOOK = gql`
  mutation removeBook($book: String!) {
    removeBook(book: $book) {
      _id
      username
      books
    }
  }
`;
