import { User } from 'src/user/entities/user.entity';
import { Media } from './media.entity';
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class MediaUserLike {
  @PrimaryColumn({
    name: 'mediaId',
    type: 'int8',
  })
  @ManyToOne(() => Media, (media) => media.likedUsers)
  media: Media;

  @PrimaryColumn({
    name: 'userId',
    type: 'int8',
  })
  @ManyToOne(() => User, (user) => user.likedMedias)
  user: User;
}
