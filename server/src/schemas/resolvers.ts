import { User } from '../models/index.js';
import { signToken, AuthenticationError } from '../services/auth.js';
import bcrypt from 'bcrypt';

interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    bookCount: number;
    savedBooks: Book[];
    isCorrectPassword(password: string): Promise<boolean>;
}

interface UserArgs {
    userId: string;
}

interface AddUserArgs {
    input: {
        username: string;
        email: string;
        password: string;
    }
}

interface Book {
    bookId: string;
    authors: string[];
    description: string;
    title: string;
    image: string;
    link: string;
}

interface AddBookArgs {
    input: {
        authors: string[];
        description: string;
        title: string;
        bookId: string;
        image: string;
        link: string;
    }
}

interface SaveBookArgs {
    userId: string;
    bookId: string;
}

interface RemoveBookArgs {
    userId: string;
    bookId: string;
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
            const { username, email, password } = input;
      
            const hashedPassword = await bcrypt.hash(password, 10);
      
            const user = await User.create({ username, email, password: hashedPassword, savedBooks: [] }) as User;
      
            const token = signToken(user.username, user.password, user._id);
            return { token, user };
          },
        login: async (_parent: any, { username, password }: { username: string; password: string; }): Promise<{ token: string; user: User }> => {
            const user = await User.findOne({ username }) as User;

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
        saveBook: async (_parent: unknown, { userId, input }: { userId: string; input: Book }) => {
            const user = await User.findOneAndUpdate(
                { _id: userId },
                {
                    $addToSet: { savedBooks: input },
                },
                { new: true, runValidators: true }
            );
        
            if (!user) {
                throw new Error('User not found');
            }
        
            return user;
        },
        removeBook: async (_parent: unknown, { userId, bookId }: RemoveBookArgs) => {
            return await User.findOneAndUpdate(
                { _id: userId },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );
        },
    },
};

export default resolvers;