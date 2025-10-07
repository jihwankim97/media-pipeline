import { User } from 'src/user/entities/user.entity';
import { Media } from './media.entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class MediaUserLike {
  @PrimaryColumn({
    name: 'mediaId',
    type: 'int8',
  })
  @ManyToOne(() => Media, (media) => media.likedUsers, { onDelete: 'CASCADE' })
  media: Media;

  @PrimaryColumn({
    name: 'userId',
    type: 'int8',
  })
  @ManyToOne(() => User, (user) => user.likedMedias, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  isLike: boolean;
}
