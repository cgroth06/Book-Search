import gql from 'graphql-tag';

const typeDefs = gql`
type User {
    _id: ID
    username: String
    email: String
    bookCount: Int
    savedBooks: [Book]
}

type Book {
    # _id: ID!
    bookId: String
    authors: [String]
    description: String
    title: String
    image: String
    link: String
}

type Auth {
    token: ID!
    user: User
}
input UserInput {
    username: String
    email: String
    password: String
}

input AddUserInput {
    username: String
    email: String
    password: String
}

input BookInput {
    authors: [String]
    description: String!
    title: String!
    bookId: String!
    image: String
    link: String
}

type Query {
    users: [User!]!
    user(userId: ID!): User
    me: User
}

type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(bookData: BookInput): User
    removeBook(bookId: String!): User
    }
`

export default typeDefs;