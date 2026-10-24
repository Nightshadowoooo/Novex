(()=>{
const C=window.NOVEX_CONFIG||{},$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const sb=window.supabase.createClient(C.url,C.anon);
const fa=n=>Number(n).toLocaleString('fa-IR'),toman=n=>fa(n)+' تومان';
const ST={pending_review:'در انتظار بررسی',pending_payment:'در انتظار پرداخت',paid:'پرداخت‌شده',in_progress:'در حال انجام',completed:'تکمیل‌شده',cancelled:'لغوشده',refunded:'بازگشت وجه'};
const dt=d=>d?new Date(d).toLocaleDateString('fa-IR'):'—';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ERR={range:'حجم نامعتبر است (۱۰–۵۰، ۶۰–۹۰ یا ۱۰۰–۳۰۰).',blocked:'حساب شما مسدود است.',forbidden:'دسترسی مجاز نیست.',diff2000:'اختلاف قیمت دوماهه و یک‌ماهه باید ۲۰۰۰ تومان باشد.',overlap:'بازه حجم با دسته فعال دیگر تداخل دارد.',invalid:'مقادیر نامعتبر است.',final:'این سفارش نهایی شده است.',self:'امکان این عملیات روی حساب خودتان نیست.'};
const errTxt=e=>{const m=(e&&e.message)||'';for(const k in ERR)if(m.includes(k))return ERR[k];
 if(/Invalid login/i.test(m))return'نام کاربری یا رمز عبور اشتباه است.';if(/not confirmed/i.test(m))return'ابتدا ایمیل خود را تأیید کنید.';
 if(/already|duplicate|unique|Database error/i.test(m))return'این نام کاربری یا ایمیل قبلاً ثبت شده است.';return'خطا در ارتباط با سرور. دوباره تلاش کنید.'};
// Modal
const modal=$('#modal');let lastFocus;
function openModal(html){lastFocus=document.activeElement;$('.mbox',modal).innerHTML=html;modal.classList.add('show');const b=$('.mbox button,.mbox a',modal);b&&b.focus()}
function closeModal(){modal.classList.remove('show');lastFocus&&lastFocus.focus()}
modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-close]'))closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if(e.key==='Tab'&&modal.classList.contains('show')){const f=$$('.mbox button,.mbox a',modal);if(!f.length)return;const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
const guestModal=()=>openModal('<div class="ic">😎</div><p style="color:#f8fafc;font-size:1.1rem">رفیق! 😎 اول باید یه حساب بسازی؛ بعدش می‌تونی قیمت کانفیگ‌هامون رو ببینی!</p><div class="acts"><a class="btn pri" href="register.html">ساخت حساب</a><a class="btn" href="login.html">از قبل حساب دارم</a><button class="btn" data-close>بستن</button></div>');
const confirmBox=(msg,fn)=>{openModal(`<div class="ic">⚠️</div><p style="color:#f8fafc">${esc(msg)}</p><div class="acts"><button class="btn pri" id="cy">تأیید</button><button class="btn" data-close>انصراف</button></div>`);$('#cy').onclick=()=>{closeModal();fn()}};
const note=(t,ok=1)=>{const m=$('.msg');if(m){m.textContent=t;m.className='msg '+(ok?'ok':'err')}};
// Auth
let session=null;
const state=async()=>{session=(await sb.auth.getSession()).data.session;return session};
async function me(){const{data}=await sb.from('profiles').select('*').eq('id',session.user.id).single();return data}
async function isAdmin(){const{data}=await sb.rpc('is_admin');return data===true}
const loginUrl=()=>'login.html?next='+encodeURIComponent(location.pathname.split('/').pop()+location.search);
async function guard(kind){await state();
 if(!session){if(kind==='user'&&document.body.dataset.page==='pricing'){guestModalRedirect();return false}location.replace(loginUrl());return false}
 if(kind==='admin'&&!(await isAdmin())){location.replace('dashboard.html');return false}return true}
function guestModalRedirect(){$('#app')&&($('#app').innerHTML='<div class="card" style="text-align:center"><p>برای مشاهده تعرفه‌ها وارد حساب شوید.</p></div>');guestModal();$('#modal [data-close]')?.addEventListener('click',()=>{});const a=$('.mbox a[href="login.html"]');a&&(a.href=loginUrl());}
sb.auth.onAuthStateChange((ev)=>{if(ev==='SIGNED_OUT'&&document.body.dataset.guard&&document.body.dataset.guard!=='none')location.replace('login.html')});
window.logout=async()=>{await sb.auth.signOut();location.href='index.html'};
const submit=(id,fn)=>{const f=$(id);if(!f)return;f.addEventListener('submit',async e=>{e.preventDefault();const b=$('button[type=submit]',f);if(b.disabled)return;b.disabled=true;const t=b.textContent;b.textContent='در حال پردازش…';note('');try{await fn(Object.fromEntries(new FormData(f)))}catch(x){note(errTxt(x),0)}b.disabled=false;b.textContent=t})};
const pwOk=p=>p.length>=8&&/[A-Za-z]/.test(p)&&/\d/.test(p);
const P={};
P.register=()=>submit('#f',async v=>{
 if(!/^[A-Za-z0-9_]{3,20}$/.test(v.username))return note('نام کاربری ۳ تا ۲۰ کاراکتر انگلیسی/عدد/_ باشد.',0);
 if(!pwOk(v.password))return note('رمز حداقل ۸ کاراکتر و شامل حرف و عدد باشد.',0);
 if(v.password!==v.password2)return note('رمزها یکسان نیستند.',0);
 const{data:ok}=await sb.rpc('username_available',{u:v.username});if(!ok)return note('این نام کاربری قبلاً گرفته شده است.',0);
 const{data,error}=await sb.auth.signUp({email:v.email,password:v.password,options:{data:{username:v.username},emailRedirectTo:location.origin+location.pathname.replace('register.html','login.html')}});
 if(error)throw error;if(data.session)location.href='dashboard.html';else note('ثبت‌نام انجام شد. لینک تأیید به ایمیل شما ارسال شد.')});
P.login=()=>{$('#tp').onclick=()=>{const i=$('#pw');i.type=i.type==='password'?'text':'password'};
 submit('#f',async v=>{let email=v.id.trim();if(!email.includes('@')){const{data}=await sb.rpc('email_for_username',{u:email});email=data||'x@invalid.local'}
 const{error}=await sb.auth.signInWithPassword({email,password:v.password});if(error)throw error;
 const n=new URLSearchParams(location.search).get('next');location.href=n&&/^[\w-]+\.html(\?[\w=&-]*)?$/.test(n)?n:'dashboard.html'})};
P.forgot=()=>submit('#f',async v=>{const{error}=await sb.auth.resetPasswordForEmail(v.email,{redirectTo:location.origin+location.pathname.replace('forgot-password.html','reset-password.html')});if(error)throw error;note('اگر ایمیل ثبت شده باشد، لینک بازیابی ارسال می‌شود.')});
P.reset=()=>submit('#f',async v=>{if(!pwOk(v.password))return note('رمز حداقل ۸ کاراکتر و شامل حرف و عدد باشد.',0);if(v.password!==v.password2)return note('رمزها یکسان نیستند.',0);
 const{error}=await sb.auth.updateUser({password:v.password});if(error)throw error;note('رمز جدید ثبت شد. در حال انتقال…');setTimeout(()=>location.href='dashboard.html',1500)});
P.dashboard=async()=>{if(!await guard('user'))return;const p=await me(),{data:s,error}=await sb.rpc('my_stats');
 if(error)return $('#app').innerHTML='<p class="msg err">خطا در دریافت اطلاعات.</p>';
 $('#who').innerHTML=`<b>${esc(p.username)}</b> · ${esc(session.user.email)} (${session.user.email_confirmed_at?'تأییدشده':'تأییدنشده'}) · عضویت: ${dt(p.created_at)} · وضعیت: ${p.status==='active'?'فعال':'مسدود'}`;
 const c=[['بسته‌های خریداری‌شده',fa(s.packages)],['مجموع حجم',fa(s.gb)+' GB'],['مجموع خرید',toman(s.total)],['سفارش در انتظار',fa(s.pending)],['حجم فعال',fa(s.active_gb)+' GB'],['آخرین سفارش',dt(s.last)]];
 $('#stats').innerHTML=c.map(x=>`<div class="card stat rv"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('');reveal();
 if(!s.last)$('#empty').hidden=false};
const PER=10;
P.orders=async()=>{if(!await guard('user'))return;let rows=[],pg=0,sk='created_at',asc=false;
 const draw=()=>{const q=$('#q').value.trim().toLowerCase(),f=$('#fs').value;
  let r=rows.filter(o=>(!f||o.status===f)&&(!q||o.id.includes(q)));r.sort((a,b)=>(a[sk]>b[sk]?1:-1)*(asc?1:-1));
  const n=Math.max(1,Math.ceil(r.length/PER));pg=Math.min(pg,n-1);
  $('#tb').innerHTML=r.length?r.slice(pg*PER,pg*PER+PER).map(o=>`<tr><td>${o.id.slice(0,8)}</td><td>${dt(o.created_at)}</td><td>${esc(o.plan_name)}</td><td>${fa(o.gb)}</td><td>${o.months===1?'یک ماه':'دو ماه'}</td><td>${fa(o.unit_price)}</td><td>${toman(o.total)}</td><td><span class="badge ${o.status}">${ST[o.status]}</span></td><td><a href="order-details.html?id=${o.id}">جزئیات</a></td></tr>`).join(''):'<tr><td colspan="9">سفارشی یافت نشد.</td></tr>';
  $('#pg').textContent=`صفحه ${fa(pg+1)} از ${fa(n)}`;$('#pv').disabled=pg<=0;$('#nx').disabled=pg>=n-1};
 $('#fs').innerHTML='<option value="">همه وضعیت‌ها</option>'+Object.entries(ST).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
 $$('th[data-k]').forEach(t=>t.onclick=()=>{asc=sk===t.dataset.k?!asc:false;sk=t.dataset.k;draw()});
 ['#q','#fs'].forEach(s=>$(s).oninput=()=>{pg=0;draw()});$('#pv').onclick=()=>{pg--;draw()};$('#nx').onclick=()=>{pg++;draw()};
 $('#tb').innerHTML='<tr><td colspan="9">در حال بارگذاری…</td></tr>';
 const{data,error}=await sb.from('orders').select('*').eq('user_id',session.user.id);
 if(error)return $('#tb').innerHTML='<tr><td colspan="9" class="msg err">خطا در ارتباط با دیتابیس.</td></tr>';rows=data;draw()};
P.orderdetails=async()=>{if(!await guard('user'))return;const id=new URLSearchParams(location.search).get('id');
 const{data}=await sb.from('orders').select('*').eq('id',id||'').maybeSingle();
 if(!data)return $('#app').innerHTML='<p class="msg err">سفارش یافت نشد.</p>';
 $('#app').innerHTML=`<div class="card"><p>شناسه: ${data.id}</p><p>دسته: ${esc(data.plan_name)}</p><p>حجم: ${fa(data.gb)} GB · مدت: ${data.months===1?'یک ماه':'دو ماه'}</p><p>قیمت هر گیگ: ${toman(data.unit_price)}</p><p class="price">${toman(data.total)}</p><p>وضعیت: <span class="badge ${data.status}">${ST[data.status]}</span></p><p>تاریخ: ${dt(data.created_at)} · آخرین تغییر: ${dt(data.updated_at)}</p><a class="btn pri" href="https://t.me/Omid1262">ادامه در تلگرام</a> <a class="btn" href="https://rubika.ir/oMiD1262">ادامه در روبیکا</a></div>`};
P.profile=async()=>{if(!await guard('user'))return;const p=await me();
 $('#info').innerHTML=`<p>نام کاربری: <b>${esc(p.username)}</b> (غیرقابل تغییر)</p><p>ایمیل: ${esc(session.user.email)} — ${session.user.email_confirmed_at?'تأییدشده':'تأییدنشده'}</p><p>عضویت: ${dt(p.created_at)}</p>`;
 submit('#f',async v=>{if(!pwOk(v.password))return note('رمز حداقل ۸ کاراکتر و شامل حرف و عدد باشد.',0);if(v.password!==v.password2)return note('رمزها یکسان نیستند.',0);const{error}=await sb.auth.updateUser({password:v.password});if(error)throw error;note('رمز عبور تغییر کرد.')})};
P.pricing=async()=>{if(!await guard('user'))return;
 const{data:plans,error}=await sb.from('plans').select('*').eq('active',true).order('sort');
 if(error||!plans.length)return $('#app').innerHTML='<p class="msg err">تعرفه‌ای در دسترس نیست.</p>';
 $('#app').innerHTML=`<div class="grid" id="pc"></div><div class="card" style="margin-top:22px"><h2 style="margin-top:0">ماشین‌حساب</h2><label>مدت</label><select id="mo"><option value="1">یک ماه</option><option value="2">دو ماه</option></select><label>حجم (گیگابایت)</label><input id="gb" type="number" min="10" max="300" step="1" value="20"><input id="sl" type="range" min="10" max="300" value="20"><p id="res" class="msg"></p><p>دسته: <b id="cat">—</b> · هر گیگ: <b id="up">—</b></p><div class="price" id="tot">—</div><button class="btn pri" id="ord" disabled>ثبت سفارش</button></div>`;
 const mo=()=>+$('#mo').value,find=g=>plans.find(p=>g>=p.min_gb&&g<=p.max_gb);
 const draw=()=>{$('#pc').innerHTML=plans.map(p=>`<div class="card"><h3>${esc(p.name)}</h3><p>${fa(p.min_gb)} تا ${fa(p.max_gb)} گیگابایت</p><div class="price">${toman(mo()===1?p.price_1m:p.price_2m)}</div><p>به‌ازای هر گیگابایت</p></div>`).join('');calc()};
 const calc=()=>{const raw=$('#gb').value,g=Number(raw),p=Number.isInteger(g)?find(g):null;$('#sl').value=Math.min(300,Math.max(10,g||10));
  $('#ord').disabled=!p;if(!p){$('#res').textContent='حجم نامعتبر است (۱۰–۵۰، ۶۰–۹۰، ۱۰۰–۳۰۰ و عدد صحیح).';$('#res').className='msg err';$('#cat').textContent=$('#up').textContent=$('#tot').textContent='—';return}
  const u=mo()===1?p.price_1m:p.price_2m;$('#res').textContent='';$('#cat').textContent=p.name;$('#up').textContent=toman(u);$('#tot').textContent=toman(u*g)};
 $('#mo').onchange=draw;$('#gb').oninput=calc;$('#sl').oninput=()=>{let g=+$('#sl').value;if(!find(g)){g=g>50&&g<60?(g<55?50:60):g>90&&g<100?(g<95?90:100):g}$('#gb').value=g;calc()};
 $('#ord').onclick=()=>{const g=+$('#gb').value,p=find(g),u=mo()===1?p.price_1m:p.price_2m;
  confirmBox(`${p.name} · ${fa(g)} GB · ${mo()===1?'یک ماه':'دو ماه'} · هر گیگ ${toman(u)} · مبلغ نهایی ${toman(u*g)}. ثبت شود؟`,async()=>{
   const{data,error}=await sb.rpc('create_order',{p_gb:g,p_months:mo()});
   if(error)return openModal(`<div class="ic">❌</div><p>${errTxt(error)}</p><div class="acts"><button class="btn" data-close>بستن</button></div>`);
   openModal(`<div class="ic">✅</div><p style="color:#f8fafc">سفارش ثبت شد (در انتظار بررسی؛ پرداخت انجام نشده است).</p><p>شناسه: ${data}</p><p>برای ادامه با ما در ارتباط باشید:</p><div class="acts"><a class="btn pri" href="https://t.me/Omid1262">تلگرام</a><a class="btn pri" href="https://rubika.ir/oMiD1262">روبیکا</a><a class="btn" href="orders.html">سفارش‌های من</a></div>`)})};
 draw()};
// Admin
const adm=async()=>guard('admin');
P.admin=async()=>{if(!await adm())return;const{data:s,error}=await sb.rpc('admin_stats');if(error)return $('#stats').innerHTML='<p class="msg err">خطا در دریافت آمار.</p>';
 const c=[['کل کاربران',fa(s.users)],['کاربران جدید (۷ روز)',fa(s.new_users)],['کل سفارش‌ها',fa(s.orders)],['در انتظار',fa(s.pending)],['تکمیل‌شده',fa(s.completed)],['فروش واجد شرایط',toman(s.sales)],['حجم واجد شرایط',fa(s.gb)+' GB'],['لغوشده',fa(s.cancelled)]];
 $('#stats').innerHTML=c.map(x=>`<div class="card stat rv"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('');reveal()};
P.adminusers=async()=>{if(!await adm())return;const{data,error}=await sb.rpc('admin_users');if(error)return $('#tb').innerHTML='<tr><td colspan="8" class="msg err">خطا.</td></tr>';
 const draw=()=>{const q=$('#q').value.toLowerCase();$('#tb').innerHTML=data.filter(u=>!q||u.username.toLowerCase().includes(q)||u.email.toLowerCase().includes(q)).map(u=>`<tr><td>${esc(u.username)}</td><td>${esc(u.email)}</td><td>${dt(u.created_at)}</td><td>${fa(u.orders)}</td><td>${fa(u.gb)}</td><td>${toman(u.total)}</td><td>${dt(u.last_order)}</td><td>${u.status==='active'?'فعال':'مسدود'} <button class="btn" data-id="${u.id}" data-s="${u.status==='active'?'blocked':'active'}">${u.status==='active'?'مسدودسازی':'رفع مسدودی'}</button></td></tr>`).join('')};
 $('#q').oninput=draw;draw();$('#tb').onclick=e=>{const b=e.target.closest('button[data-id]');if(!b)return;confirmBox('وضعیت این حساب تغییر کند؟',async()=>{const{error}=await sb.rpc('admin_set_user_status',{p_id:b.dataset.id,p_status:b.dataset.s});if(error)return alert0(error);location.reload()})}};
const alert0=e=>openModal(`<div class="ic">❌</div><p>${errTxt(e)}</p><div class="acts"><button class="btn" data-close>بستن</button></div>`);
P.adminorders=async()=>{if(!await adm())return;const{data,error}=await sb.rpc('admin_orders');if(error)return $('#tb').innerHTML='<tr><td colspan="7" class="msg err">خطا.</td></tr>';
 $('#fs').innerHTML='<option value="">همه</option>'+Object.entries(ST).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
 const opts=s=>Object.entries(ST).map(([k,v])=>`<option value="${k}"${k===s?' selected':''}>${v}</option>`).join('');
 const draw=()=>{const q=$('#q').value.toLowerCase(),f=$('#fs').value;$('#tb').innerHTML=data.filter(o=>(!f||o.status===f)&&(!q||o.id.includes(q)||o.username.toLowerCase().includes(q))).map(o=>`<tr data-id="${o.id}"><td>${o.id.slice(0,8)}</td><td>${esc(o.username)}</td><td>${dt(o.created_at)}</td><td>${esc(o.plan_name)} · ${fa(o.gb)}GB · ${o.months} ماه</td><td>${toman(o.total)}</td><td><select>${opts(o.status)}</select></td><td><input value="${esc(o.admin_note||'')}" placeholder="یادداشت"> <button class="btn">ذخیره</button></td></tr>`).join('')};
 $('#q').oninput=draw;$('#fs').onchange=draw;draw();
 $('#tb').onclick=e=>{const b=e.target.closest('button');if(!b)return;const tr=b.closest('tr');confirmBox('وضعیت/یادداشت سفارش ذخیره شود؟',async()=>{const{error}=await sb.rpc('admin_set_status',{p_id:tr.dataset.id,p_status:$('select',tr).value,p_note:$('input',tr).value});error?alert0(error):note('ذخیره شد.')})}};
P.adminpricing=async()=>{if(!await adm())return;const{data,error}=await sb.from('plans').select('*').order('sort');if(error)return note('خطا در دریافت.',0);
 $('#tb').innerHTML=data.map(p=>`<tr data-k="${p.key}"><td>${esc(p.name)}</td><td><input type="number" value="${p.min_gb}"></td><td><input type="number" value="${p.max_gb}"></td><td><input type="number" value="${p.price_1m}"></td><td><input type="number" value="${p.price_2m}"></td><td><input type="checkbox" ${p.active?'checked':''}></td><td>${dt(p.updated_at)}</td><td><button class="btn">ذخیره</button></td></tr>`).join('');
 $('#tb').onclick=e=>{const b=e.target.closest('button');if(!b)return;const tr=b.closest('tr'),i=$$('input',tr);confirmBox('تعرفه ذخیره شود؟ سفارش‌های قبلی تغییر نمی‌کنند.',async()=>{const{error}=await sb.rpc('admin_update_plan',{p_key:tr.dataset.k,p_min:+i[0].value,p_max:+i[1].value,p_1m:+i[2].value,p_2m:+i[3].value,p_active:i[4].checked});error?alert0(error):note('ذخیره شد.')})}};
P.adminsettings=async()=>{await adm()};
function reveal(){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});$$('.rv:not(.in)').forEach(el=>io.observe(el))}
// Boot
(async()=>{await state();document.body.classList.toggle('authed',!!session);
 $$('[data-guest]').forEach(e=>e.hidden=!!session);$$('[data-authed]').forEach(e=>e.hidden=!session);
 $$('[data-gated]').forEach(a=>a.addEventListener('click',e=>{if(!session){e.preventDefault();guestModal()}}));
 $$('[data-logout]').forEach(b=>b.onclick=window.logout);
 $('#burger').onclick=()=>$('nav.menu').classList.toggle('open');
 $$('nav.menu a').forEach(a=>{if(a.getAttribute('href')===location.pathname.split('/').pop())a.classList.add('on')});
 reveal();const pg=document.body.dataset.page;
 if(session&&['admin','adminusers','adminorders','adminpricing','adminsettings'].includes(pg)){}
 P[pg]&&P[pg]();
 if(session&&document.body.dataset.admin!==undefined){}
})();
})();
