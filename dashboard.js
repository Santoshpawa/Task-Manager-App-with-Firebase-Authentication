import {auth,db} from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";

import {
    doc,
    getDocs,
    updateDoc,
    addDoc,
    collection,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

window.addEventListener('DOMContentLoaded', async()=>{

const addBtn = document.getElementById('add-btn');
const container = document.getElementById('taskContainer');
let taskRef = null;

let currentUser = null;

//welcome greeting 
onAuthStateChanged(auth , async(user)=>{

    if(user){
        currentUser = user;
        taskRef = collection(db, "users-tasks",currentUser.uid,"tasks");
        document.getElementById('user-email').innerText = user.email;
        loadTasks(user);
    }else{
        window.location.href = "./login.html";
    }
})

// loading tasks
async function loadTasks(user){
    container.innerHTML='';
    try {
        const querySnap = await getDocs(taskRef);
        querySnap.forEach((doc)=>{
                let task = doc.data();
                let taskId = doc.id;
                displayTasks(user,task,taskId);
            })
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
    try {
        await addDoc(taskRef,{                     //  format of storing the task in the database....
            title: task,
            isCompleted : false,
            createdAt : Date.now()
        });
        loadTasks(currentUser);

    } catch (error) {
        alert(error);
    }
    document.getElementById('taskTitle').value = "";
})


// displaying tasks 

    async function displayTasks(user,task,taskId){

            const div = document.createElement('div');
            const checkTask = document.createElement('input');
            checkTask.type = "checkbox";
            const p = document.createElement('p');
            const editBtn = document.createElement('button');
            const deleteBtn = document.createElement('button');
            checkTask.checked = task.isCompleted;
            p.innerText = task.title;
            p.classList.add('flex-grow');
            editBtn.innerText = "Edit";
            deleteBtn.innerText = "Delete";
            if(checkTask.checked){
                    p.style.textDecoration = "line-through";
                    p.style.color = "grey";
                }else{
                     p.style.textDecoration = "none";
                     p.style.color = "black";
                }
            
            // checkbox
            
            checkTask.addEventListener('click', async()=>{
                
                if(checkTask.checked){
                    p.style.textDecoration = "line-through";
                    p.style.color = "grey";
                }else{
                     p.style.textDecoration = "none";
                     p.style.color = "black";
                }
                const taskDocRef = doc(db,"users-tasks",user.uid,"tasks",taskId);
                await updateDoc(taskDocRef,{
                    isCompleted : checkTask.checked
                })

            })

            div.append(checkTask,p,editBtn,deleteBtn);
            container.append(div);
            //  deleating a task
            deleteBtn.addEventListener('click', async()=>{
                try {
                    const taskDocRef = doc(db,"users-tasks",user.uid,"tasks",taskId);
                    await deleteDoc(taskDocRef); 
                } catch (error) {
                    alert(error);
                }
                div.remove();
            })

            //  edit a task 
            editBtn.addEventListener('click', ()=>{
                const editBox = document.createElement('input');
                const saveBtn = document.createElement('button');
                editBox.value = task.title;
                editBox.classList.add('flex-grow')
                saveBtn.innerText = "Save";
                div.replaceChild(editBox,p);
                div.replaceChild(saveBtn,editBtn);
                saveBtn.addEventListener('click', async()=>{

                    const newtask = editBox.value;
            
                    try {
                        const taskDocRef = doc(db, "users-tasks", user.uid,"tasks",taskId);
                        await updateDoc(taskDocRef, {
                            title: newtask
                        })
                        
                        
                    } catch (error) {
                        alert(error);
                    }

                    loadTasks(currentUser);
                })
            })    //  edit tast function ends here

    }   //   display function ends here

})