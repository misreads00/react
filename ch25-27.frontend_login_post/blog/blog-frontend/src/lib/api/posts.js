import qs from 'qs';
import client from './client';

export const writePost = ({ title, body, tags }) => {
      return (
          client.post('/api/posts', { title, body, tags })
      );
};

export const readPost = id => client.get(`/api/posts/${id}`);

//예시주소: 파라미터로 이렇게 값을 넣어주면 api/posts?username=tester&page=2 
export const listPosts = ({ page, username, tag }) => {
    const queryString = qs.stringify({
      page,
      username,
      tag,
    });
    return client.get(`/api/posts?${queryString}`);
  };

  /*
  축약하면 이렇게. 
  export const writePost = ({ title, body, tags }) =>
  client.post('/api/posts', { title, body, tags });
  */