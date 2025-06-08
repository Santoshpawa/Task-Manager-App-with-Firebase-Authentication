import { auth,db } from './firebase-config.js';

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js';

import {
    doc,
    setDoc
} from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js';

const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');

//signup
if(signupBtn){
    signupBtn.addEventListener('click', async()=>{
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            const userCredentials = await createUserWithEmailAndPassword(auth, email,password);
            const id = userCredentials.user.uid;
            await setDoc(doc(db,"users-tasks",id),{email});
            window.location.href = "./login.html";
        } catch (error) {
            alert(error);
        }
    })
}

// login

if(loginBtn){
    loginBtn.addEventListener('click', async()=>{
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            await signInWithEmailAndPassword(auth,email,password);
            window.location.href = "./dashboard.html";
        } catch (error) {
            alert(error)
        }
    })
}

// logout

if(logoutBtn){
    logoutBtn.addEventListener('click', async()=>{
        signOut(auth);
        window.location.href = "./login.html";
    })
}