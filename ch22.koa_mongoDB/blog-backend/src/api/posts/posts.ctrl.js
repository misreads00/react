let postId = 1;

const posts = [
    {
        id: 1,
        title: '제목',
        body: '내용',
    },
];


// export const로 작성: write, list/read, remove/replace/update 함수

// POST /api/posts { title, body }
export const write = ctx => {
    const { title, body } = ctx.request.body; 
    postId += 1; 

    const post = { id: postId, title, body };
    posts.push(post);
    ctx.body = post; 
};

// GET /api/posts 
export const list = ctx => {
    ctx.body = posts; 
};

// GET /api/posts/:id 
export const read = ctx => {
    const { id } = ctx.params;
    const post = posts.find(p => p.id.toString() === id );
    if (!post) {
        ctx.status = 404; 
        ctx.body = {
            message: '포스트가 존재하지 않습니다.',
        }; 
        return;
    }
    ctx.body = post; 
};


// DELETE /api/posts/:id 
export const remove = ctx => {
    const { id } = ctx.params;
    const index = posts.findIndex(p => p.id.toString() === id);
    if (index === -1) {
        ctx.status = 404; 
        ctx.body = {
            message:'포스트가 존재하지 않습니다.',
        };
        return;
    }
    posts.splice(index, 1); //index번째 아이템 제거 
    ctx.status = 204; //No Content 
};

// PUT /api/posts/:id { title, body } (교체)
export const replace = ctx => {
    const { id } = ctx.params;
    const index = posts.findIndex(p => p.id.toString() === id);
    if (index === -1) {
        ctx.status = 404;
        ctx.body = {
            message:'포스트가 존재하지 않습니다.',
        };
        return; 
    }
    //PUT은 전체 객체를 덮어씌우기. id를 제외한 기존정보 날리고, 객체를 새로 만든다. 
    posts[index] = {
        id, 
        ...ctx.request.body,  
    };
    ctx.body = posts[index];
};

// PATCH /api/posts/:id { title, body } (특정필드 변경)
export const update = ctx => {
    const { id } = ctx.params;
    const index = posts.findIndex(p => p.id.toString() === id); 
    if(index === -1) {
        ctx.stats = 404;
        ctx.body = {
            message:'포스트가 존재하지 않습니다',
        };
        return;
    }
    //PATCH는 기존값에 덮어씌우기. 
    posts[index] = {
        ...posts[index],
        ...ctx.request.body,
    };
    ctx.body = posts[index];
};