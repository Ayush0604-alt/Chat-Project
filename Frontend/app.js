let token = null;
let socket;
let currentConversationId = null;

// Elements
const authContainer = document.getElementById('auth-container');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const dashboard = document.getElementById('dashboard');
const conversationsList = document.getElementById('conversations-list');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const newConvBtn = document.getElementById('new-conversation-btn');
const newConvModal = document.getElementById('new-conversation-modal');
const createConvBtn = document.getElementById('create-conv-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

// ------------------- Auth -------------------
registerBtn.addEventListener('click', async () => {
  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  const res = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({username,email,password})
  });
  const data = await res.json();
  alert(data.message);
});

loginBtn.addEventListener('click', async () => {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  const res = await fetch('http://localhost:5000/api/auth/login', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({username,password})
  });
  const data = await res.json();
  if(data.success){
    token = data.accessToken;
    authContainer.style.display = 'none';
    dashboard.style.display = 'flex';
    initSocket();
    loadConversations();
  }else alert(data.message);
});

// ------------------- Socket -------------------
function initSocket(){
  socket = io('http://localhost:5000',{ auth:{token} });
  socket.on('connect',()=>console.log('Connected to socket', socket.id));

  socket.on('receive_message', message => {
    if(message.conversationId === currentConversationId) addMessageToUI(message);
  });
}

// ------------------- Conversations -------------------
async function loadConversations(){
  const res = await fetch('http://localhost:5000/api/conversations',{
    headers:{Authorization:`Bearer ${token}`}
  });
  const data = await res.json();
  conversationsList.innerHTML = '';
  data.conversations.forEach(c => {
    const li = document.createElement('li');
    li.textContent = c.lastMessage || 'New Conversation';
    li.addEventListener('click', ()=> selectConversation(c._id));
    conversationsList.appendChild(li);
  });
}

async function selectConversation(id){
  currentConversationId = id;
  messagesDiv.innerHTML = '';
  socket.emit('join_conversation',{conversationId:id});

  const res = await fetch(`http://localhost:5000/api/messages/${id}?page=1&limit=50`,{
    headers:{Authorization:`Bearer ${token}`}
  });
  const data = await res.json();
  data.messages.reverse().forEach(addMessageToUI);
}

function addMessageToUI(message){
  const div = document.createElement('div');
  div.className='message';
  div.textContent=message.text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop=messagesDiv.scrollHeight;
}

// ------------------- Send Message -------------------
sendBtn.addEventListener('click', ()=>{
  const text = messageInput.value;
  if(!text || !currentConversationId) return;
  socket.emit('send_message',{conversationId:currentConversationId,text});
  messageInput.value='';
});

// ------------------- Create New Conversation -------------------
newConvBtn.addEventListener('click', ()=> newConvModal.style.display='block');
closeModalBtn.addEventListener('click', ()=> newConvModal.style.display='none');
createConvBtn.addEventListener('click', async () => {
  const participants = document.getElementById('participants').value.split(',').map(u=>u.trim());
  const type = document.getElementById('conv-type').value;

  const res = await fetch('http://localhost:5000/api/conversations',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':`Bearer ${token}`
    },
    body: JSON.stringify({participants,type,members: participants})
  });
  const data = await res.json();
  alert(data.success ? 'Conversation created':'Error');
  newConvModal.style.display='none';
  loadConversations();
});
