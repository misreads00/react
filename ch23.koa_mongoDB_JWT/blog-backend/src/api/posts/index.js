import Router from 'koa-router';
import * as postsCtrl from './posts.ctrl'; 

const posts = new Router();

posts.get('/', postsCtrl.list);
posts.post('/', postsCtrl.write);
posts.get('/:id', postsCtrl.checkObjectId, postsCtrl.read);
posts.delete('/:id', postsCtrl.checkObjectId, postsCtrl.remove);
posts.patch('/:id', postsCtrl.checkObjectId, postsCtrl.update);
//책 예시는 마지막에 한번 더 리팩토링 한 버전이고, 이건 이전 버전.

export default posts;
