"use server";
import { getConnection } from "@/db/app-data-source";
import { currentUser } from "@clerk/nextjs/server";
import { User } from "../db/entity/user/user.entity";
import { UserSchema } from "@/db/entity/user/user.schema";
import { Like } from "typeorm";

export async function getCurrentUser() {
  try {
    const clerkUser = await currentUser();
    const connection = await getConnection();
    const repo = connection.getRepository(User);

    if (!clerkUser) {
      throw new Error("No clerk user found");
    }

    const dbUser = await repo.findOne({
      relations: { chats: {
        members: true
      } },
      where: {
        clerkId: clerkUser.id,
      },
    });

    if (dbUser) return JSON.parse(JSON.stringify(dbUser));

    const newUser = {
      username: clerkUser.username,
      email: clerkUser.primaryEmailAddress?.emailAddress,
      clerkId: clerkUser.id,
    };

    const validationResult = UserSchema.safeParse(newUser);

    if (!validationResult.success) {
      throw new Error(
        `Validation errors: ${validationResult.error.toString()}`
      );
    }

    const user = await repo.create(validationResult.data);
    const response = await repo.save(user);

    return JSON.parse(JSON.stringify(response)) as User;
  } catch (error) {
    throw error;
  }
}

export async function searchUsers(searchTerm: string) {
  try {
    if (!searchTerm) {
      throw new Error(`No search term provided`);
    }

    const connection = await getConnection();
    const repo = connection.getRepository(User);

    const users = await repo.find({
      where: {
        username: Like(`${searchTerm}%`),
      },
    });

    return JSON.parse(JSON.stringify(users)) as User[];
  } catch (error) {
    throw error;
  }
}
