const express = require('express')
const app = express()
const path = require('path')
const bcrypt = require('bcrypt')
const cookieparser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const userentry = require('./modals/user')
const crypto= require('crypto')
const postentry = require('./modals/post')
const upload = require('./utils/profile-picture')
const multer = require('multer')
app.use(express.json())
app.use(cookieparser())
app.set('view engine','ejs')
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))

// multer code





app.get('/',(req,res)=>{
    res.render('index')
})
app.post('/register',async (req,res)=>{
    let {username,password,name,email}=req.body
    let user = await userentry.findOne({email})
    if(user) res.status(500).send('already email exist');
    else{
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, async function(err, hash) {
                // Store hash in your password DB.
                let createuser = await userentry.create({
                    email,
                    username,
                    name,
                    password:hash,


                })
                res.redirect('/login')
            });
        });
    }

})
app.get('/profile/picture',Isloggend,(req,res)=>{

    res.render('uploads')

})
app.post('/uploads',Isloggend,upload.single('image'), async (req,res)=>{
    const user = await userentry.findOne({email:req.user.email})
    user.profilepic = req.file.filename
    await user.save()
    res.redirect('profile')

})
app.get('/login',(req,res)=>{
    res.render('login')
})
app.get('/profile',Isloggend,async (req,res)=>{

    const user = await userentry.findOne({email:req.user.email}).populate('post')
    // const posts = await postentry.find({user:req.user.userid}).

    res.render('profile',{user})
})
app.get('/logout',(req,res)=>{
    res.cookie('token','')
    res.redirect('/login')

})
app.post('/login',async (req,res)=>{
    let {email,password}=req.body
    let user = await userentry.findOne({email})
    if(!user) res.send('something went wrong')
    bcrypt.compare(password, user.password, function(err, result) {
        if(!result) res.send('something went wrong');
        else{
            let token=jwt.sign({email,userid:user._id},'secret')
            res.cookie('token',token)
            // res.send('succes
            res.redirect('/profile')
        }
    });
})

app.get('/edit/:id', Isloggend, async (req, res) => {
    const { id } = req.params;
    try {
        const post = await postentry.findById(id);
        if (!post) {
            return res.send('Post not found');
        }
        if (post.user.toString() !== req.user.userid) {
            return res.send('Unauthorized to edit post');
        }
        res.render('edit', { post });
    } catch (error) {
        res.send('Server error');
    }
});


app.post('/edit/:id', Isloggend, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    try {
        const post = await postentry.findById(id);
        if (!post) {
            return res.send('Post not found');
        }
        if (post.user.toString() !== req.user.userid) {
            return res.send('Unauthorized post to edit');
        }

        post.content = content; 
        await post.save(); 
        res.redirect('/profile');
    } catch (error) {
        res.send('Server error');
    }
});

app.post('/post',Isloggend,async (req,res)=>{
    const userid = req.user.userid
    let {content}= req.body
    let post = await postentry.create({
        content,
        user:userid
    })
    const user = await userentry.findOne({_id:userid})
    user.post.push(post._id)
    user.save()
    res.redirect('/profile')

})
app.get('/delete/:id',Isloggend,async (req,res)=>{
    let post = await postentry.findOneAndDelete({user:req.params.id})
    res.redirect('/profile')

})
app.get('/like/:id',Isloggend,async (req,res)=>{

    const post = await postentry.findOne({_id:req.params.id}).populate('user')
    
    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);

    }
    else{
        post.likes.splice(post.likes.indexOf(req.user.userid),1)
    }
    await post.save()
    res.redirect('/profile')
})

//middleware
function Isloggend(req,res,next){
    if(req.cookies.token==="") res.send('you are not loggend you must be loggend so go logn page')
    else{
        let data = jwt.verify(req.cookies.token,'secret')
        req.user = data
    }
    next()


}
app.listen(3000)
