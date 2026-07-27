// ============ COMMUNITY & BLOG FUNCTIONS ============

function addPost() {
    if (!state.currentUser) {
        showAlert('Please login first', 'error');
        return;
    }

    const content = document.getElementById('newPostContent').value.trim();
    
    if (!content) {
        showAlert('Please write something before posting', 'error');
        return;
    }

    const post = {
        id: Date.now(),
        userId: state.currentUser.id,
        author: state.currentUser.name,
        avatar: state.currentUser.avatar,
        content: content,
        type: 'post',
        likes: 0,
        comments: [],
        createdAt: new Date().toISOString()
    };

    state.posts.push(post);
    state.save();
    
    document.getElementById('newPostContent').value = '';
    showAlert('Post published successfully!', 'success');
    loadPosts();
}

function loadPosts() {
    const postsList = document.getElementById('postsList');
    
    if (state.posts.length === 0) {
        postsList.innerHTML = '<p style="color: var(--text-light); text-align: center;">No posts yet. Be the first to share!</p>';
        return;
    }

    const sortedPosts = [...state.posts]
        .filter(p => p.type === 'post')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    postsList.innerHTML = sortedPosts.map(post => {
        const user = state.users.find(u => u.id === post.userId);
        return `
            <div class="post-card">
                <div class="post-header">
                    <div class="post-author">
                        <div class="post-author-avatar">${post.avatar}</div>
                        <div class="post-author-info">
                            <h5>${post.author}</h5>
                            <p>${getTimeAgo(post.createdAt)}</p>
                        </div>
                    </div>
                </div>
                <p>${post.content}</p>
                <div class="post-actions">
                    <button onclick="likePost(${post.id})">👍 Like (${post.likes})</button>
                    <button onclick="commentPost(${post.id})">💬 Comment</button>
                    <button onclick="sharePost(${post.id})">📤 Share</button>
                </div>
            </div>
        `;
    }).join('');
}

function likePost(postId) {
    const post = state.posts.find(p => p.id === postId);
    if (post) {
        post.likes++;
        state.save();
        loadPosts();
    }
}

function commentPost(postId) {
    const comment = prompt('Add your comment:');
    if (comment) {
        const post = state.posts.find(p => p.id === postId);
        if (post) {
            post.comments.push({
                userId: state.currentUser.id,
                author: state.currentUser.name,
                text: comment,
                createdAt: new Date().toISOString()
            });
            state.save();
            showAlert('Comment added!', 'success');
            loadPosts();
        }
    }
}

function sharePost(postId) {
    showAlert('Post link copied to clipboard!', 'info');
}

function addQuestion() {
    if (!state.currentUser) {
        showAlert('Please login first', 'error');
        return;
    }

    const content = document.getElementById('questionContent').value.trim();
    const city = document.getElementById('questionCity').value;

    if (!content || !city) {
        showAlert('Please fill in all fields', 'error');
        return;
    }

    const question = {
        id: Date.now(),
        userId: state.currentUser.id,
        author: state.currentUser.name,
        avatar: state.currentUser.avatar,
        content: content,
        city: city,
        type: 'question',
        answers: [],
        createdAt: new Date().toISOString()
    };

    state.questions.push(question);
    state.save();

    document.getElementById('questionContent').value = '';
    document.getElementById('questionCity').value = '';
    showAlert('Question posted! Waiting for local experts to answer.', 'success');
    loadQuestions();
}

function loadQuestions() {
    const questionsList = document.getElementById('questionsList');
    
    if (state.questions.length === 0) {
        questionsList.innerHTML = '<p style="color: var(--text-light); text-align: center;">No questions yet. Ask away!</p>';
        return;
    }

    const sortedQuestions = [...state.questions]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    questionsList.innerHTML = sortedQuestions.map(question => {
        return `
            <div class="post-card">
                <div class="post-header">
                    <div class="post-author">
                        <div class="post-author-avatar">${question.avatar}</div>
                        <div class="post-author-info">
                            <h5>${question.author}</h5>
                            <p>🏙️ ${question.city} | ${getTimeAgo(question.createdAt)}</p>
                        </div>
                    </div>
                </div>
                <p><strong>Question:</strong> ${question.content}</p>
                <div class="post-actions">
                    <button onclick="answerQuestion(${question.id})">✏️ Answer</button>
                    <button onclick="markHelpful(${question.id})">👍 Helpful (${question.answers.length})</button>
                </div>
            </div>
        `;
    }).join('');
}

function answerQuestion(questionId) {
    const answer = prompt('Share your answer:');
    if (answer) {
        const question = state.questions.find(q => q.id === questionId);
        if (question) {
            question.answers.push({
                userId: state.currentUser.id,
                author: state.currentUser.name,
                text: answer,
                isLocal: state.currentUser.isLocal || false,
                createdAt: new Date().toISOString()
            });
            state.save();
            showAlert('Answer posted!', 'success');
            loadQuestions();
        }
    }
}

function markHelpful(questionId) {
    showAlert('Thank you for your feedback!', 'success');
}

function addBlogPost() {
    if (!state.currentUser) {
        showAlert('Please login first', 'error');
        return;
    }

    const title = document.getElementById('blogTitle').value.trim();
    const content = document.getElementById('blogContent').value.trim();
    const city = document.getElementById('blogCity').value;

    if (!title || !content || !city) {
        showAlert('Please fill in all fields', 'error');
        return;
    }

    const blogPost = {
        id: Date.now(),
        userId: state.currentUser.id,
        author: state.currentUser.name,
        avatar: state.currentUser.avatar,
        title: title,
        content: content,
        city: city,
        type: 'blog',
        likes: 0,
        views: 0,
        createdAt: new Date().toISOString()
    };

    state.blogPosts.push(blogPost);
    state.save();

    document.getElementById('blogTitle').value = '';
    document.getElementById('blogContent').value = '';
    document.getElementById('blogCity').value = '';
    showAlert('Blog post published successfully!', 'success');
    loadBlogPosts();
}

function loadBlogPosts() {
    const blogList = document.getElementById('blogList');
    
    if (state.blogPosts.length === 0) {
        blogList.innerHTML = '<p style="color: var(--text-light); text-align: center;">No blog posts yet. Start writing!</p>';
        return;
    }

    const sortedBlogs = [...state.blogPosts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    blogList.innerHTML = sortedBlogs.map(post => {
        return `
            <div class="post-card">
                <div class="post-header">
                    <div class="post-author">
                        <div class="post-author-avatar">${post.avatar}</div>
                        <div class="post-author-info">
                            <h5>${post.author}</h5>
                            <p>🏙️ ${post.city} | ${getTimeAgo(post.createdAt)}</p>
                        </div>
                    </div>
                </div>
                <h4 style="color: var(--primary-color); margin-bottom: 10px;">${post.title}</h4>
                <p>${post.content.substring(0, 200)}...</p>
                <div class="post-actions">
                    <button onclick="readBlogPost(${post.id})">📖 Read More</button>
                    <button onclick="likeBlogPost(${post.id})">👍 Like (${post.likes})</button>
                    <button onclick="shareBlogPost(${post.id})">📤 Share</button>
                </div>
            </div>
        `;
    }).join('');
}

function readBlogPost(postId) {
    const post = state.blogPosts.find(p => p.id === postId);
    if (post) {
        post.views++;
        state.save();
        alert(`"${post.title}"\n\n${post.content}\n\n- ${post.author}`);
    }
}

function likeBlogPost(postId) {
    const post = state.blogPosts.find(p => p.id === postId);
    if (post) {
        post.likes++;
        state.save();
        loadBlogPosts();
        showAlert('Thanks for liking!', 'success');
    }
}

function shareBlogPost(postId) {
    showAlert('Blog post link copied to clipboard!', 'info');
}