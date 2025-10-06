import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1759663585360 implements MigrationInterface {
  name = 'Init1759663585360';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "media_detail" ("id" SERIAL NOT NULL, "detail" character varying NOT NULL, CONSTRAINT "PK_1696fa08e449e19ed15946301af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "director" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "name" character varying NOT NULL, "dob" TIMESTAMP NOT NULL, "nationality" character varying NOT NULL, CONSTRAINT "PK_b85b179882f31c43324ef124fea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "genre" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_dd8cd9e50dd049656e4be1f7e8c" UNIQUE ("name"), CONSTRAINT "PK_0285d4f1655d080cfcf7d1ab141" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "media" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "title" character varying NOT NULL, "likeCount" integer NOT NULL DEFAULT '0', "disLikeCount" integer NOT NULL DEFAULT '0', "mediaFilePath" character varying NOT NULL, "creatorId" integer, "detailId" integer NOT NULL, "directorId" integer NOT NULL, CONSTRAINT "UQ_cbaa724305b68003297d3a256d1" UNIQUE ("title"), CONSTRAINT "REL_8f34f705dc4d036b3aee9432f8" UNIQUE ("detailId"), CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "media_user_like" ("mediaId" integer NOT NULL, "userId" integer NOT NULL, "isLike" boolean NOT NULL, CONSTRAINT "PK_b88c67a5d28340804e46c6aff0e" PRIMARY KEY ("mediaId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" integer NOT NULL DEFAULT '2', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "media_genres_genre" ("mediaId" integer NOT NULL, "genreId" integer NOT NULL, CONSTRAINT "PK_f85392f00f31c4789722e54372f" PRIMARY KEY ("mediaId", "genreId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_36b0e74fa76fe48efff21168c3" ON "media_genres_genre" ("mediaId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_41b9677669949573cf26709bef" ON "media_genres_genre" ("genreId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "media" ADD CONSTRAINT "FK_4fd9c27adef50f63eaef9c34eb4" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" ADD CONSTRAINT "FK_8f34f705dc4d036b3aee9432f8d" FOREIGN KEY ("detailId") REFERENCES "media_detail"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" ADD CONSTRAINT "FK_4b23a4c7a264d73706fae1a63fb" FOREIGN KEY ("directorId") REFERENCES "director"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_user_like" ADD CONSTRAINT "FK_a1c08f6e5d35b51244b9e8a6cf4" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_user_like" ADD CONSTRAINT "FK_eb6942132d03d06ab0e32152aba" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_genres_genre" ADD CONSTRAINT "FK_36b0e74fa76fe48efff21168c3d" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_genres_genre" ADD CONSTRAINT "FK_41b9677669949573cf26709bef9" FOREIGN KEY ("genreId") REFERENCES "genre"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "media_genres_genre" DROP CONSTRAINT "FK_41b9677669949573cf26709bef9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_genres_genre" DROP CONSTRAINT "FK_36b0e74fa76fe48efff21168c3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_user_like" DROP CONSTRAINT "FK_eb6942132d03d06ab0e32152aba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_user_like" DROP CONSTRAINT "FK_a1c08f6e5d35b51244b9e8a6cf4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" DROP CONSTRAINT "FK_4b23a4c7a264d73706fae1a63fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" DROP CONSTRAINT "FK_8f34f705dc4d036b3aee9432f8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" DROP CONSTRAINT "FK_4fd9c27adef50f63eaef9c34eb4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_41b9677669949573cf26709bef"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_36b0e74fa76fe48efff21168c3"`,
    );
    await queryRunner.query(`DROP TABLE "media_genres_genre"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "media_user_like"`);
    await queryRunner.query(`DROP TABLE "media"`);
    await queryRunner.query(`DROP TABLE "genre"`);
    await queryRunner.query(`DROP TABLE "director"`);
    await queryRunner.query(`DROP TABLE "media_detail"`);
  }
}
