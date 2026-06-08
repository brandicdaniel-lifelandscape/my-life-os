
const btn=document.getElementById('save');
const entries=document.getElementById('entries');
const area=document.querySelector('textarea');

function render(){
 let data=JSON.parse(localStorage.getItem('tendEntries')||'[]');
 entries.innerHTML=data.reverse().map(x=>`<div class="entry"><b>${x.date}</b><br>${x.text}</div>`).join('');
}
btn.onclick=()=>{
 let data=JSON.parse(localStorage.getItem('tendEntries')||'[]');
 data.push({date:new Date().toLocaleString(),text:area.value});
 localStorage.setItem('tendEntries',JSON.stringify(data));
 area.value='';
 render();
}
render();
