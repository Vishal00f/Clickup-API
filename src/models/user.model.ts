import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


interface IUserMethods {
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  getFullName(): string;
}

interface IUser extends Document{
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  avatar?: string;
  workspaceIn?: mongoose.Types.ObjectId[];
  tasks: mongoose.Types.ObjectId[];
  refreshToken?: string;
  fullName: string;
}

interface IUserModel extends Model<IUser, IUserMethods> {
  // Add any static methods here if needed
}

const userSchema = new Schema<IUser, IUserModel, IUserMethods>({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: [true, "username is required"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
    minlength: [8, "password must be 8 characters long"],
    validate: {
      validator: function(v: string) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(v);
      },
      message: (props: {value: string}) => 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: (props: {value: string}) => `${props.value} is not a valid email address`
    }
  },
  avatar: {
    type: String
  },
  workspaceIn: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Workspace",
    default: []
  },
  tasks: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Task",
    default: []
  },
  refreshToken: {
    type: String,
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  },
});

userSchema.virtual("fullName").get(function(this: IUser) {
  return this.firstName + " " + this.lastName;
});

userSchema.methods.getFullName = function(this: IUser & IUserMethods) {
  return this.firstName + " " + this.lastName;
};

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function(this: IUser & IUserMethods, password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function(this: IUser & IUserMethods) {
  if (process.env.ACCESS_TOKEN_SECRET !== undefined) {
    return jwt.sign(
      {
        _id: this._id,
        username: this.username,
        email: this.email
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
  } else {
    throw new Error("ACCESS TOKEN SECRET is missing");
  }
};

userSchema.methods.generateRefreshToken = function(this: IUser & IUserMethods) {
  if (process.env.REFRESH_TOKEN_SECRET !== undefined) {
    return jwt.sign(
      {
        _id: this._id,
        username: this.username,
        email: this.email
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
  } else {
    throw new Error("REFRESH TOKEN SECRET is missing");
  }
};

export const User = mongoose.model<IUser, IUserModel>("User", userSchema);