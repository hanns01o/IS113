const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  bio: {
    type: String,
    default: "Movie lover and reviewer."
  },
  favouriteGenre: {
    type: Array,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  watchList: {
    type: [Number],
    default: []
  }
});

// module.exports = mongoose.models.User || mongoose.model("User", userSchema);
userSchema.statics.createUser = function(newUser) {
  return this.create(newUser);
};

userSchema.statics.getUserByEmail = function(email) {
  return this.findOne({ email });
};

const User = mongoose.models.User || mongoose.model("User", userSchema, "users");

module.exports = User;