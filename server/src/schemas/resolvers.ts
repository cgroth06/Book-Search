import mongoose from 'mongoose';
import { User } from '../models/index.js';
import { signToken, AuthenticationError } from '../services/auth.js';
import { BookDocument } from '../models/Book.js';

interface User {
    _id: string;
    username: string ;
    email: string | null;
    password: string | null;
    bookCount: number | null;
    savedBooks: Book[];
    isCorrectPassword(password: string): Promise<boolean>;
}

interface AddUserArgs {
    input: {
        username: string;
        email: string;
        password: string;
    }
}

interface UserArgs {
    userId: string;
}

interface LoginUserArgs {
    username: string;
    email: string;
    password: string;

}

interface Book {
    bookId: string;
    authors: string[];
    description: string;
    title: string;
    image: string;
    link: string;
}

// interface AddBookArgs {
//     input: {
//         authors: string[];
//         description: string;
//         title: string;
//         bookId: string;
//         image: string;
//         link: string;
//     }
// }

interface AddBookArgs {
    userId: mongoose.Types.ObjectId;
    book: BookDocument;
}

interface RemoveBookArgs {
    userId: mongoose.Types.ObjectId;
    book: BookDocument;
}

interface Context {
    user?: User;
}

const resolvers = {
    Query: {
        users: async () => {
            return User.find().sort({ createdAt: -1 });
        },
        user: async (_parent: any, { userId }: UserArgs): Promise<User | null> => {
            return await User.findOne({ _id: userId });
        },
        me: async (_parent: any, _args: any, context: Context): Promise<User | null> => {
            if (context.user) {
                return await User.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
    Mutation: {
        addUser: async (_parent: any, { input }: AddUserArgs) => {
            const user = await User.create({ ...input });

            const token = signToken(user.username, user.email, user._id);
                  
            console.log(user)
            return { token, user };
          },
        login: async (_parent: any, { email, password }: LoginUserArgs ) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        saveBook: async (_parent: any, { userId, book }: AddBookArgs) => {
            const user = await User.findOneAndUpdate(
                { _id: userId },
                {
                    $addToSet: { savedBooks: book },
                },
                { new: true, runValidators: true }
            );

            if (!user) {
                throw new Error('User not found');
            }

            return user;
        },
        removeBook: async (_parent: unknown, { book }: RemoveBookArgs, context: any) => {
            return await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks:  book } },
                { new: true }
            );
        },
    },
};

export default resolvers;