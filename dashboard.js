import {auth,db} from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";

import {
    doc,
    getDoc,
    getDocs,
    updateDoc,
    arrayRemove,
    arrayUnion,
    setDoc,
    collection
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

window.addEventListener('DOMContentLoaded', async()=>{

const addBtn = document.getElementById('add-btn');
const container = document.getElementById('taskContainer');


let currentUser = null;

//welcome greeting 
onAuthStateChanged(auth , async(user)=>{

    if(user){
        currentUser = user;
        document.getElementById('user-email').innerText = user.email;
        loadTasks(user);
    }else{
        window.location.href = "./login.html";
    }
})

// loading tasks
async function loadTasks(user){
    container.innerHTML='';
    const taskRef = doc(db,'users-tasks',user.uid);
    let userTasks = [];
    try {
        const docSnap = await getDoc(taskRef);
        if(docSnap.exists()){
            const data = docSnap.data();
            userTasks = data.tasks || [];
            displayTasks(userTasks,user);
        }
    } catch (error) {
        alert(error);
    }


}

// adding tasks
addBtn.addEventListener('click', async()=>{
    let task = document.getElementById('taskTitle').value;
    task = task.trim();
    if(task==''){
        return;
    }
    
    const taskRef = doc(db, "users-tasks",currentUser.uid);

    try {
        const docSnap = await getDoc(taskRef);
        if(!docSnap.exists()){
            await setDoc(taskRef , { 
                email : currentUser.email,
                tasks : [task]
            })
        }else {
            await updateDoc(taskRef , {
                tasks : arrayUnion(task)
            })
        }
        document.getElementById('taskTitle').value = "";
        loadTasks(currentUser);
    } catch (error) {
        alert(error);
    }
    

})


// displaying tasks 

    async function displayTasks(tasks,user){
        tasks.forEach((task)=>{
            const div = document.createElement('div');
            const checkTask = document.createElement('checkbox');
            const p = document.createElement('p');
            const editBtn = document.createElement('button');
            const deleteBtn = document.createElement('button');
           
            p.innerText = task;
            editBtn.innerText = "Edit";
            deleteBtn.innerText = "Delete";
            
            div.append(checkTask,p,editBtn,deleteBtn);
            container.append(div);
            //  deleating a task
            deleteBtn.addEventListener('click', async()=>{
                try {
                    const taskRef = doc(db,"users-tasks",user.uid);
                    await updateDoc(taskRef , {
                        tasks : arrayRemove(task)
                    })
                    loadTasks(user);
                } catch (error) {
                    alert(error);
                }
                div.remove();
            })

            //  edit a task 
            editBtn.addEventListener('click', ()=>{
                const editBox = document.createElement('textarea');
                const saveBtn = document.createElement('button');
                editBox.value = task;
                saveBtn.innerText = "Save";
                div.replaceChild(editBox,p);
                div.replaceChild(saveBtn,editBtn);
                saveBtn.addEventListener('click', async()=>{

                    const newtask = editBox.value;
                    try {
                        const taskRef = doc(db, "users-tasks", user.uid);
                        await updateDoc(taskRef, {
                            tasks: arrayRemove(task)
                        })
                        await updateDoc(taskRef,{
                            tasks: arrayUnion(newtask)
                        })
                        loadTasks(user);
                    } catch (error) {
                        alert(error);
                    }
                })
            })

            
        })
    }

})