const { prisma } = require("../prisma/prisma-client");
const bcrypt = require("bcryptjs");
const Jdenticon = require("jdenticon");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const UserController = {
  register: async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const png = Jdenticon.toPng(`${name}${Date.now()}`, 200);
      const avatarName = `${name}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, "/../uploads", avatarName);
      fs.writeFileSync(avatarPath, png);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          imageUrl: `/uploads/${avatarName}`,
        },
      });

      res.json(user);
    } catch (error) {
      console.error("Error while registering", error);
      res.status(500).json({ error: "Something went wrong register" });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign({ userId: user.id }, `${process.env.SECRET_KEY}`);

      res.json({ token });
    } catch (error) {
      console.error("Error while logging in", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  current: async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.userId,
        },
        include: {
          Items: true,
          collections: {
            include: {
              items: true,
            },
          },
        },
      });

      if (!user) {
        return res
          .status(400)
          .json({ error: "Error while getting current user" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error while getting current user (catched)", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  updateUser: async (req, res) => {
    const { id } = req.params;
    const { email, name } = req.body;

    let filePath;

    if (req.file && req.file.path) {
      filePath = req.file.path;
    }

    if (id !== req.user.userId) {
      return res.status(403).json({ error: "No permission" });
    }

    try {
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: { email: email },
        });

        if (existingUser && existingUser.id !== id) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined,
          name: name || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
        },
      });

      res.json(user);
    } catch (error) {
      console.error("Update user failed", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getUserById: async (req, res) => {
    const { id } = req.params;
    // const userId = req.user.userId;

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { collections: { include: { items: true } }, Items: true },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // const someElsesCollections = prisma.collection.findMany({
      //   where: {
      //     AND: [{ authorId: userId }],
      //   },
      // });

      res.json({ ...user }); //, someElsesCollections
    } catch (error) {
      console.error("Error while getting user", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
};

module.exports = UserController;
