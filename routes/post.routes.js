const router = require("express").Router();

const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Comment = require('../models/Comment.model')

router.get("/post-create", (req, res) => {
  User.find()
    .then((dbUsers) => {
      res.render("posts/create", { dbUsers });
    })
    .catch((err) => console.log(`Err while displaying post input page: ${err}`));
});

router.post('/post-create', (req, res, next) => {
  const { title, content, imageUrl, author } = req.body;

  Post.create({ title, content, imageUrl, author })
    .then(dbPost => {
    
      return User.findByIdAndUpdate(author, { $push: { posts: dbPost._id } });
    })
    .then(() => res.redirect('/posts'))
    .catch(err => {
      console.log(`Err while creating the post in the DB: ${err}`);
      next(err);
    });
});

router.get('/', (req, res, next) => {
  Post.find()
    .populate('author')
    .then(dbPosts => {
      res.render('posts/list.hbs', { posts: dbPosts });
    })
    .catch(err => {
      console.log(`Err while getting the posts from the DB: ${err}`);
      next(err);
    });
});

router.get('/details/:postId', (req, res, next) => {
  const { postId } = req.params;
 
  Post.findById(postId)
    .populate('author')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        model: 'User'
      }
    })
    .then(foundPost => res.render('posts/details', foundPost))
    .catch(err => {
      console.log(`Err while getting a single post from the  DB: ${err}`);
      next(err);
    });
});

router.get('/edit/:postId', (req, res, next) => {

  Post.findById(req.params.postId)
  .populate('author')
  .then((foundPost) => {
      console.log("Found Post", foundPost)
      res.render('posts/edit.hbs', foundPost)
  })
  .catch((err) => {
      console.log(err)
      next(err)
  })

});

router.post('/edit/:postId', (req, res, next) => {

  const { title, content, imageUrl } = req.body

  Post.findByIdAndUpdate(
      req.params.postId,
      {
          title,
          content,
          imageUrl
      },
      {new: true}
  )
  .then((updatedPost) => {
      res.redirect(`/posts/details/${updatedPost._id}`)
  })
  .catch((err) => {
      console.log(err)
      next(err)
  })

});

router.get('/delete/:postId', (req, res, next) => {
  
  Post.findByIdAndDelete(req.params.postId)
  .then((deletedPost) => {
      console.log("Deleted post:", deletedPost)
      res.redirect('/posts')
  })
  .catch((err) => {
      console.log(err)
      next(err)
  })

});

module.exports = router;
