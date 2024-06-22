import { MigrationInterface, QueryRunner } from "typeorm";
import { user1 } from "../entity/user/fixtures";
import { User } from "../entity/user/user.entity";

export class Seed1711548747398 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        
        queryRunner.clearDatabase();
        queryRunner.manager.create(User, user1);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
