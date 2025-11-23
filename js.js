// Using localStorage only - no backend
const api = null;

// Simple localStorage-based auth
function signupLocal(email, password, fullName, organization) {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    throw new Error('Email already exists');
  }
  const user = {
    id: makeId(),
    email,
    fullName: fullName || '',
    organization: organization || '',
    role: users.length === 0 ? 'Owner' : 'Editor',
    tenantId: 'tenant_default'
  };
  users.push(user);
  setUsers(users);
  currentOwnerEmail = email;
  return { user };
}

function loginLocal(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  if (!user) {
    throw new Error('Invalid email or password');
  }
  currentOwnerEmail = email;
  return { user };
}

const views = Array.from(document.querySelectorAll(".view"));
const routeLinks = document.querySelectorAll("[data-route]");

function go(route, setHash = true){
  if(!route) return;
  views.forEach(v => v.classList.remove("active"));
  const target = document.getElementById(route);
  if(target) {
    target.classList.add("active");
    if(setHash) location.hash = route;
    requestAnimationFrame(() => {
      window.scrollTo({top:0, behavior:"smooth"});
      // Re-initialize scroll visibility when navigating to home
      if(route === "home") {
        setTimeout(() => {
          initScrollVisibility();
        }, 300);
      }
    });
  } else {
    console.warn(`Route "${route}" not found`);
  }
}
function currentRouteFromHash(){
  const h = location.hash.replace("#","").trim();
  return h && document.getElementById(h) ? h : "home";
}
routeLinks.forEach(el=>{
  el.addEventListener("click",(e)=>{
    e.preventDefault();
    go(el.dataset.route);
  });
});
window.addEventListener("hashchange", ()=>{
  const r = currentRouteFromHash();
  go(r, false);
});

const toast = document.getElementById("toast");
function showToast(msg, duration = 2500){
  if(!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=>{
    toast.classList.remove("show");
  }, duration);
}
function setLoading(button, isLoading){
  if(!button) return;
  button.disabled = isLoading;
  button.style.opacity = isLoading ? "0.7" : "1";
}

// Authentication functions removed - using backend API only

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const signupSubmit = document.getElementById("signupSubmit");
const loginSubmit = document.getElementById("loginSubmit");
const signupFullName = document.getElementById("signupFullName");
const signupOrganization = document.getElementById("signupOrganization");

const googleBtns = ["googleBtn","googleBtn2"].map(id=>document.getElementById(id)).filter(Boolean);
const appleBtns = ["appleBtn","appleBtn2"].map(id=>document.getElementById(id)).filter(Boolean);

if(signupForm){
  signupForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const email = signupEmail.value.trim().toLowerCase();
    const password = signupPassword.value;
    const fullName = signupFullName?.value.trim() || "";
    const organization = signupOrganization?.value.trim() || "";
    if(password.length < 6){
      showToast("Password must be 6+ characters");
      return;
    }
    setLoading(signupSubmit, true);
    try{
      const response = signupLocal(email, password, fullName, organization);
      if(userEmailEl) userEmailEl.textContent = response.user.email;
      if(userAvatarEl) userAvatarEl.textContent = response.user.email[0].toUpperCase();
      if(userRoleEl) userRoleEl.textContent = response.user.role;
      showToast("Account created");
      go("dashboard");
    }catch(err){
      showToast(err.message || "Signup failed", 4000);
      console.error("Signup error:", err);
    }finally{
      setLoading(signupSubmit, false);
    }
  });
}

if(loginForm){
  loginForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const email = loginEmail.value.trim().toLowerCase();
    const password = loginPassword.value;
    setLoading(loginSubmit, true);
    try{
      const response = loginLocal(email, password);
      if(userEmailEl) userEmailEl.textContent = response.user.email;
      if(userAvatarEl) userAvatarEl.textContent = response.user.email[0].toUpperCase();
      if(userRoleEl) userRoleEl.textContent = response.user.role;
      showToast("Logged in");
      go("dashboard");
    }catch(err){
      showToast(err.message || "Login failed", 4000);
      console.error("Login error:", err);
    }finally{
      setLoading(loginSubmit, false);
    }
  });
}

if(logoutBtn){
  logoutBtn.addEventListener("click", async ()=>{
    setLoading(logoutBtn, true);
    try{
      currentOwnerEmail = null;
      showToast("Logged out");
      go("home");
    }catch(err){
      showToast("Logout failed", 2000);
      console.error("Logout error:", err);
    }finally{
      setLoading(logoutBtn, false);
    }
  });
}

googleBtns.forEach(btn=>{
  btn.addEventListener("click", async ()=>{
    setLoading(btn, true);
    try{
      showToast("Google sign-in not available. Please use email/password.", 3000);
    }catch(err){
      showToast("Google sign-in not available", 3000);
    }finally{
      setLoading(btn, false);
    }
  });
});

appleBtns.forEach(btn=>{
  btn.addEventListener("click", async ()=>{
    setLoading(btn, true);
    try{
      showToast("Apple sign-in not available. Please use email/password.", 3000);
    }catch(err){
      showToast("Apple sign-in not available", 3000);
    }finally{
      setLoading(btn, false);
    }
  });
});

// Password visibility toggle
const signupPasswordToggle = document.getElementById("signupPasswordToggle");
const loginPasswordToggle = document.getElementById("loginPasswordToggle");
const signupPassword = document.getElementById("signupPassword");
const loginPassword = document.getElementById("loginPassword");

if(signupPasswordToggle && signupPassword){
  signupPasswordToggle.addEventListener("click", ()=>{
    const type = signupPassword.getAttribute("type") === "password" ? "text" : "password";
    signupPassword.setAttribute("type", type);
    signupPasswordToggle.textContent = type === "password" ? "👁" : "🙈";
  });
}

if(loginPasswordToggle && loginPassword){
  loginPasswordToggle.addEventListener("click", ()=>{
    const type = loginPassword.getAttribute("type") === "password" ? "text" : "password";
    loginPassword.setAttribute("type", type);
    loginPasswordToggle.textContent = type === "password" ? "👁" : "🙈";
  });
}

const LS_USERS = "formify_users";
const LS_FORMS = "formify_forms";
const LS_SUBS = "formify_submissions";
const LS_STARTS = "formify_starts";
const LS_GUEST = "formify_guest_id";

function getUsers(){ return JSON.parse(localStorage.getItem(LS_USERS) || "[]"); }
function setUsers(u){ localStorage.setItem(LS_USERS, JSON.stringify(u)); }
function getForms(){ return JSON.parse(localStorage.getItem(LS_FORMS) || "[]"); }
function setForms(f){ localStorage.setItem(LS_FORMS, JSON.stringify(f)); }
function getSubs(){ return JSON.parse(localStorage.getItem(LS_SUBS) || "[]"); }
function setSubs(s){ localStorage.setItem(LS_SUBS, JSON.stringify(s)); }
function getStarts(){ return JSON.parse(localStorage.getItem(LS_STARTS) || "[]"); }
function setStarts(s){ localStorage.setItem(LS_STARTS, JSON.stringify(s)); }

function makeId(){ return Math.random().toString(36).slice(2,10); }

function getGuestId(){
  let id = sessionStorage.getItem(LS_GUEST);
  if(!id){
    id = "guest_" + makeId() + makeId();
    sessionStorage.setItem(LS_GUEST, id);
  }
  return id;
}

function ensureUserProfile(email, extraData = {}){
  if(!email) return;
  const users = getUsers();
  let u = users.find(x=>x.email===email);
  if(!u){
    const tenantId = "tenant_default";
    const first = !users.some(x=>x.tenantId===tenantId);
    u = {
      id: makeId(),
      email,
      tenantId,
      role: first ? "Owner" : "Editor",
      activity: { formsCreated:0, submissionsMade:0, lastActive:Date.now() },
      ...extraData
    };
    users.push(u);
  }else{
    // Update existing user with new data if provided
    if(extraData.fullName) u.fullName = extraData.fullName;
    if(extraData.organization) u.organization = extraData.organization;
  }
  u.activity.lastActive = Date.now();
  setUsers(users);
}

function getCurrentUserProfile(){
  if(currentOwnerEmail==="guest") return null;
  return getUsers().find(u=>u.email===currentOwnerEmail) || null;
}

async function updateDashboardStats(){
  const totalFormsCountEl = document.getElementById("totalFormsCount");
  const totalSubmissionsCountEl = document.getElementById("totalSubmissionsCount");
  const publishedFormsCountEl = document.getElementById("publishedFormsCount");
  const avgCompletionTimeEl = document.getElementById("avgCompletionTime");
  const dashboardWelcomeText = document.getElementById("dashboardWelcomeText");
  const dashboardActivity = document.getElementById("dashboardActivity");
  const dashboardTrends = document.getElementById("dashboardTrends");
  
  if(!totalFormsCountEl) return;
  
  const me = getCurrentUserProfile();
  let allForms = [];
  let userSubs = [];
  
  // Use local storage only
  allForms = getForms();
  const allSubs = getSubs();
  userSubs = allSubs.filter(s => {
    const form = allForms.find(f => f.versionId === s.versionId);
    return form && form.ownerEmail === currentOwnerEmail;
  });
  
  const userForms = me ? allForms.filter(f => f.ownerEmail === currentOwnerEmail || f.ownerId === me.id) : [];
  const published = userForms.filter(f => f.published).length;
  
  // Calculate average completion time
  const avgTime = userSubs.length ? Math.round(userSubs.reduce((a,b)=>a+(b.completionMs||0),0)/userSubs.length/1000) : 0;
  
  // Update welcome text
  if(dashboardWelcomeText && me?.fullName){
    dashboardWelcomeText.textContent = `Welcome back, ${me.fullName.split(' ')[0]}!`;
  }
  
  // Update stats
  totalFormsCountEl.textContent = userForms.length;
  totalSubmissionsCountEl.textContent = userSubs.length;
  publishedFormsCountEl.textContent = published;
  if(avgCompletionTimeEl) avgCompletionTimeEl.textContent = `${avgTime}s`;
  
  // Calculate changes
  const now = Date.now();
  const thisMonth = now - (30 * 24 * 60 * 60 * 1000);
  const today = new Date().setHours(0,0,0,0);
  
  const formsThisMonth = userForms.filter(f => f.createdAt >= thisMonth).length;
  const subsToday = userSubs.filter(s => s.createdAt >= today).length;
  
  const formsChangeEl = document.getElementById("formsChange");
  const submissionsChangeEl = document.getElementById("submissionsChange");
  if(formsChangeEl) formsChangeEl.textContent = `+${formsThisMonth} this month`;
  if(submissionsChangeEl) submissionsChangeEl.textContent = `+${subsToday} today`;
  
  // Update recent activity
  if(dashboardActivity){
    const recentSubs = userSubs.slice(0, 5);
    if(recentSubs.length === 0){
      dashboardActivity.innerHTML = '<div class="activity-empty">No recent activity</div>';
    }else{
      dashboardActivity.innerHTML = recentSubs.map(s => {
        const form = allForms.find(f => f.versionId === s.versionId);
        const timeAgo = getTimeAgo(s.createdAt);
        return `
          <div class="activity-item">
            <div class="activity-icon">📥</div>
            <div class="activity-content">
              <div class="activity-title">${esc(form?.title || "Untitled Form")}</div>
              <div class="activity-time">${timeAgo}</div>
            </div>
          </div>
        `;
      }).join("");
    }
  }
  
  // Update trends chart
  if(dashboardTrends){
    const trendDays = 7;
    const today = new Date();
    today.setHours(0,0,0,0);
    const trend = [];
    for(let i=trendDays-1;i>=0;i--){
      const d = new Date(today);
      d.setDate(today.getDate()-i);
      const start = d.getTime();
      const end = start + 86400000;
      const count = userSubs.filter(s=>s.createdAt>=start && s.createdAt<end).length;
      trend.push({date:d, count});
    }
    const maxCount = Math.max(1, ...trend.map(t=>t.count));
    
    if(maxCount === 0){
      dashboardTrends.innerHTML = '<div class="trends-empty">No data available yet</div>';
    }else{
      dashboardTrends.innerHTML = `
        <div class="trends-bars">
          ${trend.map(t => `
            <div class="trend-bar-item">
              <div class="trend-value">${t.count}</div>
              <div class="trend-bar" style="height:${(t.count/maxCount)*100}%"></div>
              <div class="trend-label">${t.date.toLocaleDateString('en-US', {weekday:'short'})}</div>
            </div>
          `).join("")}
        </div>
      `;
    }
  }
  
  // Update analytics charts
  updateAnalyticsCharts(userSubs, userForms, allForms);
}

function updateAnalyticsCharts(userSubs, userForms, allForms){
  // Update submissions chart
  const chartCanvas = document.getElementById("submissionsChart");
  if(chartCanvas){
    drawSubmissionsChart(chartCanvas, userSubs);
  }
  
  // Update performance stats
  const starts = getStarts();
  const userStarts = starts.filter(s => {
    const form = allForms.find(f => f.versionId === s.versionId);
    return form && form.ownerEmail === currentOwnerEmail;
  });
  
  const completionRate = userStarts.length > 0 
    ? Math.round((userSubs.length / userStarts.length) * 100) 
    : 0;
  
  const responseRate = userForms.length > 0
    ? Math.round((userForms.filter(f => f.published).length / userForms.length) * 100)
    : 0;
  
  const completionRateBar = document.getElementById("completionRateBar");
  const completionRateValue = document.getElementById("completionRateValue");
  const responseRateBar = document.getElementById("responseRateBar");
  const responseRateValue = document.getElementById("responseRateValue");
  
  if(completionRateBar) completionRateBar.style.width = `${completionRate}%`;
  if(completionRateValue) completionRateValue.textContent = `${completionRate}%`;
  if(responseRateBar) responseRateBar.style.width = `${responseRate}%`;
  if(responseRateValue) responseRateValue.textContent = `${responseRate}%`;
}

function drawSubmissionsChart(canvas, submissions){
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Get last 14 days data
  const trendDays = 14;
  const today = new Date();
  today.setHours(0,0,0,0);
  const trend = [];
  for(let i=trendDays-1;i>=0;i--){
    const d = new Date(today);
    d.setDate(today.getDate()-i);
    const start = d.getTime();
    const end = start + 86400000;
    const count = submissions.filter(s=>s.createdAt>=start && s.createdAt<end).length;
    trend.push({date:d, count});
  }
  
  const maxCount = Math.max(1, ...trend.map(t=>t.count));
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const barWidth = chartWidth / trendDays;
  
  // Draw grid lines
  ctx.strokeStyle = "rgba(226,232,240,0.5)";
  ctx.lineWidth = 1;
  for(let i=0; i<=4; i++){
    const y = padding + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
  
  // Draw bars
  trend.forEach((t, i) => {
    const barHeight = (t.count / maxCount) * chartHeight;
    const x = padding + i * barWidth + barWidth * 0.1;
    const y = padding + chartHeight - barHeight;
    const w = barWidth * 0.8;
    
    // Gradient
    const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
    gradient.addColorStop(0, "#10b981");
    gradient.addColorStop(1, "#34d399");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, barHeight);
    
    // Value label
    if(t.count > 0){
      ctx.fillStyle = "#059669";
      ctx.font = "11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t.count.toString(), x + w/2, y - 4);
    }
  });
  
  // Draw labels
  ctx.fillStyle = "#64748b";
  ctx.font = "10px Inter, sans-serif";
  ctx.textAlign = "center";
  trend.forEach((t, i) => {
    const x = padding + i * barWidth + barWidth / 2;
    const label = t.date.toLocaleDateString('en-US', {month:'short', day:'numeric'});
    ctx.fillText(label, x, height - 10);
  });
}

function getTimeAgo(timestamp){
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff/60000);
  const hours = Math.floor(diff/3600000);
  const days = Math.floor(diff/86400000);
  
  if(minutes < 1) return "Just now";
  if(minutes < 60) return `${minutes}m ago`;
  if(hours < 24) return `${hours}h ago`;
  if(days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function canEditForm(form){
  const me = getCurrentUserProfile();
  if(!me) return false;
  if(me.role==="Owner"||me.role==="Admin") return form.tenantId===me.tenantId;
  return form.ownerEmail===me.email;
}
function canViewForm(form){
  const me = getCurrentUserProfile();
  if(!me) return false;
  if(me.role==="Owner"||me.role==="Admin") return form.tenantId===me.tenantId;
  return form.ownerEmail===me.email;
}

let currentForm = null;
let currentOwnerEmail = "guest";
let structuralDirty = false;

const formTitleInput = document.getElementById("formTitle");
const fieldList = document.getElementById("fieldList");
const newFormBtn = document.getElementById("newFormBtn");
const duplicateFormBtn = document.getElementById("duplicateFormBtn");
const loadFormsBtn = document.getElementById("loadFormsBtn");
const saveDraftBtn = document.getElementById("saveDraftBtn");
const publishBtn = document.getElementById("publishBtn");
const unpublishBtn = document.getElementById("unpublishBtn");
const previewBtn = document.getElementById("previewBtn");
const analyticsBtn = document.getElementById("analyticsBtn");
const historyBtn = document.getElementById("historyBtn");

const savedFormsEl = document.getElementById("savedForms");
const versionListEl = document.getElementById("versionList");

const previewModal = document.getElementById("previewModal");
const previewForm = document.getElementById("previewForm");
const previewTitle = document.getElementById("previewTitle");

const analyticsModal = document.getElementById("analyticsModal");
const analyticsBody = document.getElementById("analyticsBody");
const historyModal = document.getElementById("historyModal");
const historyBody = document.getElementById("historyBody");

const closePreview = document.getElementById("closePreview");
const closePreview2 = document.getElementById("closePreview2");
const closeAnalytics = document.getElementById("closeAnalytics");
const closeAnalytics2 = document.getElementById("closeAnalytics2");
const closeHistory = document.getElementById("closeHistory");
const closeHistory2 = document.getElementById("closeHistory2");

const userEmailEl = document.getElementById("userEmail");
const userAvatarEl = document.getElementById("userAvatar");
const userRoleEl = document.getElementById("userRole");

const allowEditSubmissions = document.getElementById("allowEditSubmissions");
const accessModeEl = document.getElementById("accessMode");
const blockGuestsEl = document.getElementById("blockGuests");
const singleSubmissionEl = document.getElementById("singleSubmission");
const openAtEl = document.getElementById("openAt");
const closeAtEl = document.getElementById("closeAt");

// Settings toggle functionality
const settingsToggle = document.getElementById("settingsToggle");
const settingsEl = document.querySelector(".settings");
if(settingsToggle && settingsEl){
  // Collapse by default
  settingsEl.classList.add("collapsed");
  settingsToggle.addEventListener("click", ()=>{
    settingsEl.classList.toggle("collapsed");
  });
}

// Handle new add question buttons (with icons)
document.addEventListener("click", (e)=>{
  if(e.target.closest(".add-question-btn")){
    const btn = e.target.closest(".add-question-btn");
    if(btn.dataset.type){
    addField(btn.dataset.type);
    }
  }
});

async function newForm(ownerEmail){
  try {
    // Use local storage only
  const me = getCurrentUserProfile();
  const formId = makeId();
  currentForm = {
    formId,
    version: 1,
    versionId: formId + "_v1",
    tenantId: me?.tenantId || "tenant_default",
    ownerEmail: ownerEmail || "guest",
    title: "",
    fields: [],
    settings: {
      allowEditSubmissions:false,
      accessMode:"public",
      blockGuests:false,
      singleSubmission:false,
      openAt:"",
      closeAt:""
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    publishedAt: null
  };
  structuralDirty = false;
  renderBuilder();
  } catch (error) {
    console.error("Error creating form:", error);
    showToast("Failed to create form");
  }
}
newFormBtn.addEventListener("click", ()=> {
  newForm(currentOwnerEmail).catch(err => {
    console.error("Error creating form:", err);
    showToast("Failed to create form");
  });
});

function duplicateCurrentForm(){
  if(!currentForm) return showToast("Nothing to duplicate");
  const me = getCurrentUserProfile();
  if(!me) return showToast("Login first");

  const copy = JSON.parse(JSON.stringify(currentForm));
  const newFormId = makeId();
  copy.formId = newFormId;
  copy.version = 1;
  copy.versionId = newFormId + "_v1";
  copy.title = (copy.title || "Untitled form") + " (copy)";
  copy.ownerEmail = me.email;
  copy.tenantId = me.tenantId;
  copy.createdAt = Date.now();
  copy.updatedAt = Date.now();
  copy.publishedAt = null;

  const forms = getForms();
  forms.push(copy);
  setForms(forms);
  currentForm = copy;
  structuralDirty = false;
  renderBuilder();
  renderSavedForms();
  showToast("Form duplicated");
}
duplicateFormBtn.addEventListener("click", duplicateCurrentForm);

function migrateOldField(f){
  if(f.type==="shortText") return {...f, type:"text", multiline:false};
  if(f.type==="longText") return {...f, type:"text", multiline:true};
  if(f.type==="radio") return {...f, type:"dropdown"};
  if(f.type==="ratingScale") return {...f, type:"ratingStars", validation:{...f.validation, max:5, min:1}};
  return f;
}

function addField(type){
  if(!type) {
    showToast("Field type is required");
    return;
  }
  if(!currentForm) newForm(currentOwnerEmail);
  if(!currentForm) {
    showToast("Failed to create form");
    return;
  }
  structuralDirty = true;

  const base = {
    id: makeId(),
    type,
    label: "",
    placeholder: "",
    help: "",
    required: false,
    defaultValue: "",
    validation: { minLen:null, maxLen:null, min:null, max:null, regex:"" },
    options: []
  };

  if(type==="text"){
    base.multiline = false;
  }

  if(["checkboxes","dropdown"].includes(type)){
    base.options = [""];
  }

  if(type==="ratingStars"){
    base.validation.min = 1;
    base.validation.max = 5;
  }

  currentForm.fields.push(base);
  currentForm.updatedAt = Date.now();
  renderFields();
}

function removeField(id){
  if(!currentForm || !id) return;
  structuralDirty = true;
  currentForm.fields = currentForm.fields.filter(f=>f.id!==id);
  currentForm.updatedAt = Date.now();
  renderFields();
  showToast("Field deleted");
}

function duplicateField(id){
  const idx = currentForm.fields.findIndex(f=>f.id===id);
  if(idx<0) return;
  structuralDirty = true;
  const clone = JSON.parse(JSON.stringify(currentForm.fields[idx]));
  clone.id = makeId();
  clone.label = (clone.label || "Field") + " (copy)";
  currentForm.fields.splice(idx+1,0,clone);
  currentForm.updatedAt = Date.now();
  renderFields();
}

function moveField(id, dir){
  structuralDirty = true;
  const i = currentForm.fields.findIndex(f=>f.id===id);
  if(i<0) return;
  const j = i+dir;
  if(j<0||j>=currentForm.fields.length) return;
  const arr = currentForm.fields;
  [arr[i],arr[j]]=[arr[j],arr[i]];
  currentForm.updatedAt = Date.now();
  renderFields();
}

function addOption(fid){
  structuralDirty = true;
  const f = currentForm.fields.find(x=>x.id===fid);
  f.options.push("");
  currentForm.updatedAt = Date.now();
  renderFields();
}

function removeOption(fid, idx){
  structuralDirty = true;
  const f = currentForm.fields.find(x=>x.id===fid);
  f.options.splice(idx,1);
  if(f.options.length===0) f.options.push("");
  currentForm.updatedAt = Date.now();
  renderFields();
}

function maybeVersionBump(){
  const subsExist = getSubs().some(s=>s.formId===currentForm.formId);
  if(subsExist && structuralDirty){
    const forms = getForms();
    const versions = forms.filter(f=>f.formId===currentForm.formId);
    const nextV = Math.max(...versions.map(v=>v.version)) + 1;

    const newV = JSON.parse(JSON.stringify(currentForm));
    newV.version = nextV;
    newV.versionId = newV.formId + "_v" + nextV;
    newV.createdAt = Date.now();
    newV.updatedAt = Date.now();
    newV.publishedAt = null;

    forms.push(newV);
    setForms(forms);

    currentForm = newV;
    structuralDirty = false;
    showToast("New version created");
  }
}

function renderBuilder(){
  formTitleInput.value = currentForm?.title || "";
  formTitleInput.oninput = ()=>{
    currentForm.title = formTitleInput.value;
    currentForm.updatedAt = Date.now();
  };

  allowEditSubmissions.checked = !!currentForm.settings.allowEditSubmissions;
  allowEditSubmissions.onchange = ()=>{
    currentForm.settings.allowEditSubmissions = allowEditSubmissions.checked;
    currentForm.updatedAt = Date.now();
  };

  accessModeEl.value = currentForm.settings.accessMode || "public";
  accessModeEl.onchange = ()=>{
    currentForm.settings.accessMode = accessModeEl.value;
    currentForm.updatedAt = Date.now();
  };

  blockGuestsEl.checked = !!currentForm.settings.blockGuests;
  blockGuestsEl.onchange = ()=>{
    currentForm.settings.blockGuests = blockGuestsEl.checked;
    currentForm.updatedAt = Date.now();
  };

  singleSubmissionEl.checked = !!currentForm.settings.singleSubmission;
  singleSubmissionEl.onchange = ()=>{
    currentForm.settings.singleSubmission = singleSubmissionEl.checked;
    currentForm.updatedAt = Date.now();
  };

  openAtEl.value = currentForm.settings.openAt || "";
  openAtEl.onchange = ()=>{
    currentForm.settings.openAt = openAtEl.value;
    currentForm.updatedAt = Date.now();
  };

  closeAtEl.value = currentForm.settings.closeAt || "";
  closeAtEl.onchange = ()=>{
    currentForm.settings.closeAt = closeAtEl.value;
    currentForm.updatedAt = Date.now();
  };

  renderFields();
  renderVersions();
}

function renderVersions(){
  const versions = getForms().filter(f=>f.formId===currentForm.formId).sort((a,b)=>a.version-b.version);
  versionListEl.innerHTML = versions.map(v=>{
    return `
      <div class="version-item ${v.versionId===currentForm.versionId?"active":""}">
        <div>v${v.version} ${v.publishedAt?"• Published":""}</div>
        <button class="btn btn-sm ghost" data-vid="${v.versionId}">Open</button>
      </div>
    `;
  }).join("");

  versionListEl.querySelectorAll("button[data-vid]").forEach(b=>{
    b.onclick=()=>{
      const vid = b.dataset.vid;
      const f = getForms().find(x=>x.versionId===vid);
      if(f){
        currentForm=f;
        structuralDirty=false;
        renderBuilder();
        go("builder");
      }
    };
  });
}

function renderFields(){
  fieldList.innerHTML = "";

  currentForm.fields = currentForm.fields.map(migrateOldField);
  
  // Show/hide floating publish button (appears when 4+ questions)
  const floatingPublish = document.getElementById("floatingPublish");
  if(floatingPublish){
    if(currentForm.fields.length >= 4){
      floatingPublish.classList.add("show");
    }else{
      floatingPublish.classList.remove("show");
    }
  }

  currentForm.fields.forEach((f, index)=>{
    const card = document.createElement("div");
    card.className="q-card";

    card.innerHTML = `
      <div class="q-head">
        <div class="q-type">${index+1}. ${prettyType(f.type)}</div>
        <div class="field-actions">
          <button class="btn btn-sm ghost" data-a="up">Up</button>
          <button class="btn btn-sm ghost" data-a="down">Down</button>
          <button class="btn btn-sm ghost" data-a="dup">Duplicate</button>
          <button class="btn btn-sm ghost" data-a="del">Delete</button>
        </div>
      </div>

      <div class="field-grid">
        <div class="field-row">
          <label>Label</label>
          <input data-k="label" value="${esc(f.label)}" placeholder="Question label"/>
        </div>
        <div class="field-row">
          <label>Placeholder</label>
          <input data-k="placeholder" value="${esc(f.placeholder)}" placeholder="Input placeholder"/>
        </div>
        <div class="field-row">
          <label>Help text</label>
          <input data-k="help" value="${esc(f.help)}" placeholder="Help/description"/>
        </div>
        <div class="field-row">
          <label>Default value</label>
          <input data-k="defaultValue" value="${esc(f.defaultValue)}" placeholder="Default"/>
        </div>
      </div>

      ${f.type==="text" ? `
      <div class="field-grid" style="margin-top:8px">
        <div class="field-row">
          <label class="inline">
            <input type="checkbox" data-k="multiline" ${f.multiline?"checked":""}>
            Long answer (textarea)
          </label>
        </div>
      </div>` : ``}

      <div class="field-grid" style="margin-top:8px">
        <div class="field-row">
          <label class="inline">
            <input type="checkbox" data-k="required" ${f.required?"checked":""}>
            Required
          </label>
        </div>
        <div class="field-row">
          ${renderValidationInputs(f)}
        </div>
      </div>

      <div class="q-body">${renderFieldBody(f)}</div>
    `;

    card.querySelector('[data-a="del"]').onclick = ()=>removeField(f.id);
    card.querySelector('[data-a="dup"]').onclick = ()=>duplicateField(f.id);
    card.querySelector('[data-a="up"]').onclick = ()=>moveField(f.id,-1);
    card.querySelector('[data-a="down"]').onclick = ()=>moveField(f.id,1);

    card.querySelectorAll("[data-k]").forEach(inp=>{
      const k = inp.dataset.k;
      if(inp.type==="checkbox"){
        inp.onchange = ()=>{
          f[k]=inp.checked;
          currentForm.updatedAt=Date.now();
        };
      }else{
        inp.oninput = ()=>{
          f[k]=inp.value;
          currentForm.updatedAt=Date.now();
        };
      }
    });

    const vMinLen = card.querySelector('[data-v="minLen"]');
    const vMaxLen = card.querySelector('[data-v="maxLen"]');
    const vMin = card.querySelector('[data-v="min"]');
    const vMax = card.querySelector('[data-v="max"]');
    const vRegex = card.querySelector('[data-v="regex"]');

    if(vMinLen) vMinLen.oninput=()=>{ f.validation.minLen = vMinLen.value?Number(vMinLen.value):null; currentForm.updatedAt=Date.now(); };
    if(vMaxLen) vMaxLen.oninput=()=>{ f.validation.maxLen = vMaxLen.value?Number(vMaxLen.value):null; currentForm.updatedAt=Date.now(); };
    if(vMin) vMin.oninput=()=>{ f.validation.min = vMin.value?Number(vMin.value):null; currentForm.updatedAt=Date.now(); };
    if(vMax) vMax.oninput=()=>{ f.validation.max = vMax.value?Number(vMax.value):null; currentForm.updatedAt=Date.now(); };
    if(vRegex) vRegex.oninput=()=>{ f.validation.regex = vRegex.value; currentForm.updatedAt=Date.now(); };

    if(["checkboxes","dropdown"].includes(f.type)){
      card.querySelector('[data-act="addopt"]').onclick=()=>addOption(f.id);
      card.querySelectorAll('[data-act="opt"]').forEach((optInput,idx)=>{
        optInput.value = f.options[idx]||"";
        optInput.oninput=(e)=>{
          f.options[idx]=e.target.value;
          currentForm.updatedAt=Date.now();
        };
      });
      card.querySelectorAll('[data-act="rmopt"]').forEach((rmBtn,idx)=>{
        rmBtn.onclick=()=>removeOption(f.id,idx);
      });
    }

    fieldList.appendChild(card);
  });
}

function renderValidationInputs(f){
  const showText = ["text","email","phoneIQ"].includes(f.type);
  const showNumber = ["number","range","ratingStars"].includes(f.type);

  let html = `<div style="display:grid;gap:6px">`;

  if(showText){
    html += `
      <label>Min/Max length</label>
      <div style="display:flex;gap:6px">
        <input data-v="minLen" type="number" placeholder="min" value="${f.validation.minLen??""}">
        <input data-v="maxLen" type="number" placeholder="max" value="${f.validation.maxLen??""}">
      </div>
      <label>Regex (optional)</label>
      <input data-v="regex" placeholder="e.g. ^[A-Za-z]+$" value="${esc(f.validation.regex||"")}">
    `;
  }

  if(showNumber){
    html += `
      <label>Min/Max</label>
      <div style="display:flex;gap:6px">
        <input data-v="min" type="number" placeholder="min" value="${f.validation.min??""}">
        <input data-v="max" type="number" placeholder="max" value="${f.validation.max??""}">
      </div>
    `;
  }

  html += `</div>`;
  return html;
}

function renderFieldBody(f){
  if(f.type==="text"){
    return f.multiline
      ? `<textarea disabled rows="3" placeholder="Text answer..."></textarea>`
      : `<input disabled placeholder="Text answer...">`;
  }

  if(["checkboxes","dropdown"].includes(f.type)){
    const opts = f.options.map((o,i)=>`
      <div class="option">
        <input data-act="opt" placeholder="Option ${i+1}" />
        <button class="remove-opt" data-act="rmopt">✕</button>
      </div>
    `).join("");
    return `${opts}<button class="btn btn-sm ghost" data-act="addopt">+ Add option</button>`;
  }

  if(f.type==="number") return `<input disabled type="number" placeholder="Number">`;
  if(f.type==="range") return `<input disabled type="range">`;
  if(f.type==="date") return `<input disabled type="date">`;
  if(f.type==="time") return `<input disabled type="time">`;
  if(f.type==="boolean") return `<select disabled><option>Yes</option><option>No</option></select>`;
  if(f.type==="email") return `<input disabled type="email" placeholder="name@example.com">`;
  if(f.type==="phoneIQ") return `<input disabled placeholder="07xx xxx xxxx">`;
  if(f.type==="url") return `<input disabled type="url" placeholder="https://example.com">`;
  if(f.type==="ratingStars") return `<div class="subtle">★★★★★</div>`;

  return "";
}

function prettyType(t){
  return ({
    text:"Text",
    checkboxes:"Checkboxes",
    dropdown:"Dropdown",
    number:"Number",
    range:"Range slider",
    date:"Date",
    time:"Time",
    boolean:"Yes/No",
    ratingStars:"Star rating",
    email:"Email",
    phoneIQ:"Iraqi phone",
    url:"Website URL"
  })[t]||t;
}

async function saveDraft(){
  if(!currentForm) {
    showToast("Nothing to save");
    return;
  }
  const me = getCurrentUserProfile();
  if(me && !canEditForm(currentForm)) {
    showToast("No permission to edit this form");
    return;
  }

  maybeVersionBump();

  currentForm.title = currentForm.title.trim() || "Untitled form";

  // Use local storage only
  const forms = getForms();
  const idx = forms.findIndex(f=>f.versionId===currentForm.versionId);
  if(idx>=0) forms[idx]=currentForm;
  else forms.push(currentForm);

  setForms(forms);
  renderSavedForms();
  renderVersions();
  showToast("Draft saved");
}

async function publishForm(){
  await saveDraft();
  
  // Use local storage only
  currentForm.publishedAt = Date.now();
  currentForm.published = true;
  await saveDraft();
  const url = `${location.origin}${location.pathname}?form=${currentForm.versionId}#builder`;
  if(navigator.clipboard) navigator.clipboard.writeText(url).catch(()=>{});
  showToast("Published! Link copied");
}

async function unpublishForm(){
  if(!currentForm) return;
  
  // Use local storage only
  currentForm.publishedAt = null;
  currentForm.published = false;
  await saveDraft();
  showToast("Unpublished");
}

saveDraftBtn.addEventListener("click",saveDraft);
publishBtn.addEventListener("click",publishForm);
unpublishBtn.addEventListener("click",unpublishForm);
loadFormsBtn.addEventListener("click",renderSavedForms);

const floatingPublishBtn = document.getElementById("floatingPublishBtn");
if(floatingPublishBtn){
  floatingPublishBtn.addEventListener("click", publishForm);
}

const addTemplateBtn = document.getElementById("addTemplateBtn");
if(addTemplateBtn){
  addTemplateBtn.addEventListener("click", ()=>{
    if(!currentForm) newForm(currentOwnerEmail);
    if(!currentForm) return;
    
    // Add a quick template with common fields
    const templateFields = [
      {type: "text", label: "Full Name", placeholder: "Enter your full name", required: true},
      {type: "email", label: "Email Address", placeholder: "your@email.com", required: true},
      {type: "text", label: "Message", placeholder: "Enter your message", multiline: true, required: false}
    ];
    
    templateFields.forEach(template => {
      const base = {
        id: makeId(),
        type: template.type,
        label: template.label || "",
        placeholder: template.placeholder || "",
        help: "",
        required: template.required || false,
        defaultValue: "",
        validation: { minLen:null, maxLen:null, min:null, max:null, regex:"" },
        options: []
      };
      
      if(template.type === "text" && template.multiline){
        base.multiline = true;
      }
      
      currentForm.fields.push(base);
    });
    
    structuralDirty = true;
    currentForm.updatedAt = Date.now();
    renderFields();
    showToast("Quick template added!");
  });
}

function renderSavedForms(){
  const me = getCurrentUserProfile();
  let forms = getForms();

  if(me){
    forms = forms.filter(f=>f.tenantId===me.tenantId && canViewForm(f));
    const latest = {};
    forms.forEach(f=>{
      if(!latest[f.formId] || latest[f.formId].version < f.version){
        latest[f.formId]=f;
      }
    });
    forms = Object.values(latest);
  }else{
    forms = [];
  }

  savedFormsEl.innerHTML = forms.length ? "" : `<div class="subtle small">No forms yet.</div>`;

  forms.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)).forEach(f=>{
    const row = document.createElement("div");
    row.className="saved-form";
    row.innerHTML=`
      <div>
        <div class="title">${esc(f.title||"Untitled form")}</div>
        <div class="meta">v${f.version} • ${f.fields.length} fields ${f.publishedAt?"• Published":""}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-sm ghost" data-act="open">Open</button>
        <button class="btn btn-sm ghost" data-act="del">Delete</button>
        ${f.publishedAt?`<button class="btn btn-sm" data-act="link">Link</button>`:""}
      </div>
    `;
    row.querySelector('[data-act="open"]').onclick=async ()=>{
      // Try to load from API if available
      if (api && api.getToken && api.getToken() && api.getForm && f.versionId) {
        try {
          const form = await api.getForm(f.versionId);
          const me = getCurrentUserProfile();
          currentForm = {
            formId: form.formId,
            version: form.version,
            versionId: form.versionId,
            tenantId: me?.tenantId || f.tenantId || "tenant_default",
            ownerEmail: currentOwnerEmail,
            title: form.title,
            fields: form.fields || [],
            settings: form.settings || f.settings || {},
            published: form.published,
            publishedAt: form.published ? Date.now() : null,
            createdAt: new Date(form.createdAt).getTime(),
            updatedAt: new Date(form.updatedAt).getTime()
          };
        } catch (error) {
          console.error("Failed to load form from API, using cached:", error);
      currentForm = f;
        }
      } else {
        currentForm = f;
      }
      structuralDirty=false;
      renderBuilder();
      go("builder");
    };
    row.querySelector('[data-act="del"]').onclick=()=>{
      if(!canEditForm(f)) {
        showToast("No permission to delete");
        return;
      }
      const all = getForms().filter(x=>x.formId!==f.formId);
      setForms(all);
      if(currentForm?.formId===f.formId) newForm(currentOwnerEmail);
      renderSavedForms();
      showToast("Form deleted");
    };
    const linkBtn = row.querySelector('[data-act="link"]');
    if(linkBtn){
      linkBtn.onclick=()=>{
        const url = `${location.origin}${location.pathname}?form=${f.versionId}#builder`;
        if(navigator.clipboard) navigator.clipboard.writeText(url).catch(()=>{});
        showToast("Link copied");
      };
    }
    savedFormsEl.appendChild(row);
  });
}

function openPreview(){
  if(!currentForm) return showToast("Nothing to preview");

  currentForm.fields = currentForm.fields.map(migrateOldField);

  const me = getCurrentUserProfile();
  const s = currentForm.settings;

  if(s.accessMode==="authOnly" && !me){
    showToast("Login required");
    go("login");
    return;
  }
  if(s.blockGuests && !me){
    showToast("Guests are blocked");
    return;
  }

  const now = Date.now();
  if(s.openAt){
    const o = new Date(s.openAt).getTime();
    if(now < o){ showToast("Form not open yet"); return; }
  }
  if(s.closeAt){
    const c = new Date(s.closeAt).getTime();
    if(now > c){ showToast("Form closed"); return; }
  }

  if(s.singleSubmission){
    const subs = getSubs();
    const guestId = getGuestId();
    const already = subs.some(x=>{
      if(x.formId!==currentForm.formId) return false;
      if(me) return x.user_id===me.id;
      return x.guest_id===guestId;
    });
    if(already){ showToast("Single submission only"); return; }
  }

  const ident = me ? me.id : getGuestId();
  const startKey = currentForm.versionId + "_" + ident;
  const starts = getStarts();
  if(!starts.some(x=>x.startKey===startKey)){
    starts.push({
      startKey,
      formId: currentForm.formId,
      versionId: currentForm.versionId,
      ident,
      createdAt: now
    });
    setStarts(starts);
  }

  sessionStorage.setItem("formify_preview_start", String(now));

  previewTitle.textContent = currentForm.title || "Untitled form";
  previewForm.innerHTML = currentForm.fields.map(f=>renderPreviewField(f)).join("");
  previewModal.classList.add("show");
  previewModal.setAttribute("aria-hidden","false");
}

function closePreviewModal(){
  previewModal.classList.remove("show");
  previewModal.setAttribute("aria-hidden","true");
  previewForm.reset();
}

previewBtn.addEventListener("click",openPreview);
if(closePreview) closePreview.addEventListener("click",closePreviewModal);
if(closePreview2) closePreview2.addEventListener("click",closePreviewModal);

// Close modal on backdrop click
if(previewModal) {
  previewModal.addEventListener("click",(e)=>{
    if(e.target === previewModal) closePreviewModal();
  });
}

// Close modal on ESC key
document.addEventListener("keydown",(e)=>{
  if(e.key === "Escape" && previewModal.classList.contains("show")) {
    closePreviewModal();
  }
  if(e.key === "Escape" && analyticsModal.classList.contains("show")) {
    analyticsModal.classList.remove("show");
  }
  if(e.key === "Escape" && historyModal.classList.contains("show")) {
    historyModal.classList.remove("show");
  }
});

previewForm.addEventListener("submit", async (e)=>{
  e.preventDefault();

  // Validate required fields
  let isValid = true;
  currentForm.fields.forEach(f => {
    if(f.required) {
      const el = previewForm.querySelector(`[name="${f.id}"]`);
      if(f.type === "checkboxes") {
        const checked = previewForm.querySelectorAll(`input[name="${f.id}"]:checked`);
        if(checked.length === 0) {
          isValid = false;
          showToast(`"${f.label || 'Field'}" is required`, 2000);
        }
      } else if(el && !el.value.trim()) {
        isValid = false;
        el.focus();
        showToast(`"${f.label || 'Field'}" is required`, 2000);
      }
    }
  });

  if(!isValid) return;

  const startT = Number(sessionStorage.getItem("formify_preview_start")||Date.now());
  const completionMs = Date.now()-startT;

  const data = {};
  currentForm.fields.forEach(f=>{
    if(f.type==="checkboxes"){
      const vals = Array.from(previewForm.querySelectorAll(`input[name="${f.id}"]:checked`)).map(x=>x.value);
      data[f.id]=vals;
    }else{
      const el = previewForm.querySelector(`[name="${f.id}"]`);
      if(el) data[f.id]=el.value;
    }
  });

  const me = getCurrentUserProfile();
  const userId = me?.id || null;

  // Try API first
  if (api && api.getToken && api.getToken() && api.startForm && api.submitForm && currentForm.versionId && currentForm.published) {
    try {
      // Track form start
      try {
        await api.startForm(currentForm.versionId);
      } catch (e) {
        // Ignore start errors
      }

      // Submit form
      await api.submitForm(currentForm.versionId, data, completionMs);
      showToast("Submitted successfully! ✓", 2000);
      setTimeout(() => {
        closePreviewModal();
        previewForm.reset();
      }, 2000);
      return;
    } catch (apiError) {
      console.error("API submission failed, using local storage:", apiError);
      showToast(apiError.message || "Submission failed", 3000);
    }
  }

  // Fallback to local storage
  const guestId = me ? null : getGuestId();
  const sub = {
    id: makeId(),
    formId: currentForm.formId,
    versionId: currentForm.versionId,
    tenantId: currentForm.tenantId,
    user_email: me?.email || null,
    user_id: me?.id || null,
    guest_id: guestId,
    createdAt: Date.now(),
    completionMs,
    data
  };

  const subs = getSubs();
  subs.push(sub);
  setSubs(subs);

  showToast("Submitted successfully! ✓", 2000);
  setTimeout(() => {
    closePreviewModal();
  }, 500);
});

function renderPreviewField(f){
  const label = esc(f.label || "Untitled");
  const help = f.help ? `<div class="subtle">${esc(f.help)}</div>` : "";
  const req = f.required ? "required" : "";
  const def = f.defaultValue ?? "";

  if(f.type==="text"){
    if(f.multiline){
      return `<div><label>${label}${f.required?" *":""}</label>${help}
        <textarea name="${f.id}" rows="3" placeholder="${esc(f.placeholder||"")}" ${req}
          ${textValidationAttrs(f.validation)}>${esc(def)}</textarea>
      </div>`;
    }
    return `<div><label>${label}${f.required?" *":""}</label>${help}
      <input name="${f.id}" placeholder="${esc(f.placeholder||"")}" value="${esc(def)}" ${req}
        ${textValidationAttrs(f.validation)}>
    </div>`;
  }

  if(f.type==="checkboxes"){
    const opts = normalizeOptions(f.options).map((o,i)=>`
      <label class="small" style="display:flex;gap:8px;align-items:center;margin:6px 0">
        <input type="checkbox" name="${f.id}" value="${esc(o)}">
        ${esc(o||`Option ${i+1}`)}
      </label>
    `).join("");
    return `<div><label>${label}${f.required?" *":""}</label>${help}${opts}</div>`;
  }

  if(f.type==="dropdown"){
    const opts = normalizeOptions(f.options).map((o,i)=>`<option value="${esc(o)}">${esc(o||`Option ${i+1}`)}</option>`).join("");
    return `<div><label>${label}${f.required?" *":""}</label>${help}
      <select name="${f.id}" ${req}>
        <option value="">Select...</option>
        ${opts}
      </select>
    </div>`;
  }

  if(f.type==="number"){
    return `<div><label>${label}${f.required?" *":""}</label>${help}
      <input type="number" name="${f.id}" placeholder="${esc(f.placeholder||"")}" value="${esc(def)}" ${req}
        ${numValidationAttrs(f.validation)}>
    </div>`;
  }

  if(f.type==="range"){
    const min = f.validation.min ?? 0;
    const max = f.validation.max ?? 100;
    const v = def!==""?def:Math.floor((min+max)/2);
    return `<div><label>${label}${f.required?" *":""}</label>${help}
      <input type="range" name="${f.id}" min="${min}" max="${max}" value="${v}">
    </div>`;
  }

  if(f.type==="date"){
    return `<div><label>${label}${f.required?" *":""}</label>${help}
      <input type="date" name="${f.id}" value="${esc(def)}" ${req}>
    </div>`;
  }

  if(f.type==="time"){
    return `<div><label>${label}${f.required?" *":""}</label>${help}
      <input type="time" name="${f.id}" value="${esc(def)}" ${req}>
    </div>`;
  }

  if(f.type==="boolean"){
    return `<div><label>${label}${f.required?" *":""}</label>${help}
      <select name="${f.id}" ${req}>
        <option value="">Select...</option>
        <option value="Yes" ${def==="Yes"?"selected":""}>Yes</option>
        <option value="No" ${def==="No"?"selected":""}>No</option>
      </select>
    </div>`;
  }

  if(f.type==="email"){
    return `<div><label>${label}${f.required?" *":""}</label>${help}
      <input type="email" name="${f.id}" placeholder="${esc(f.placeholder||"name@example.com")}" value="${esc(def)}" ${req}
        ${textValidationAttrs(f.validation)}>
    </div>`;
  }

  if(f.type==="phoneIQ"){
    return `<div><label>${label}${f.required?" *":""}</label>${help}
      <input name="${f.id}" placeholder="${esc(f.placeholder||"07xx xxx xxxx")}" value="${esc(def)}" ${req}
        pattern="^07[3-9][0-9]{8}$">
    </div>`;
  }

  if(f.type==="url"){
    return `<div><label>${label}${f.required?" *":""}</label>${help}
      <input type="url" name="${f.id}" placeholder="${esc(f.placeholder||"https://example.com")}" value="${esc(def)}" ${req}
        ${textValidationAttrs(f.validation)}>
    </div>`;
  }

  if(f.type==="ratingStars"){
    const max = f.validation.max ?? 5;
    const opts = Array.from({length:max},(_,i)=>i+1).map(v=>`
      <label class="small" style="display:inline-flex;gap:6px;align-items:center;margin-right:8px">
        <input type="radio" name="${f.id}" value="${v}" ${req}>
        ${"★".repeat(v)}
      </label>
    `).join("");
    return `<div><label>${label}${f.required?" *":""}</label>${help}${opts}</div>`;
  }

  return "";
}

function normalizeOptions(arr){
  if(!arr || !arr.length) return [""];
  return arr;
}
function textValidationAttrs(v){
  const a = [];
  if(v.minLen!=null) a.push(`minlength="${v.minLen}"`);
  if(v.maxLen!=null) a.push(`maxlength="${v.maxLen}"`);
  if(v.regex) a.push(`pattern="${esc(v.regex)}"`);
  return a.join(" ");
}
function numValidationAttrs(v){
  const a = [];
  if(v.min!=null) a.push(`min="${v.min}"`);
  if(v.max!=null) a.push(`max="${v.max}"`);
  return a.join(" ");
}

async function openDashboard(){
  if(!currentForm) return showToast("No form selected");
  
  let subsAll = [];
  let startsAll = [];
  
  // Try API first
  if (api && api.getToken && api.getToken() && api.getFormSubmissions && currentForm.formId) {
    try {
      const subs = await api.getFormSubmissions(currentForm.formId);
      subsAll = subs.map(s => ({
        formId: currentForm.formId,
        versionId: s.versionId,
        user_id: s.userEmail ? 1 : null,
        data: s.data,
        completionMs: s.completionMs,
        createdAt: new Date(s.createdAt).getTime()
      }));
      // Starts are tracked separately, use local for now
      startsAll = getStarts().filter(s=>s.formId===currentForm.formId);
    } catch (error) {
      console.error("API dashboard failed, using local storage:", error);
      subsAll = getSubs().filter(s=>s.formId===currentForm.formId);
      startsAll = getStarts().filter(s=>s.formId===currentForm.formId);
    }
  } else {
    subsAll = getSubs().filter(s=>s.formId===currentForm.formId);
    startsAll = getStarts().filter(s=>s.formId===currentForm.formId);
  }
  
  const subsCur = subsAll.filter(s=>s.versionId===currentForm.versionId);
  const startsCur = startsAll.filter(s=>s.versionId===currentForm.versionId);

  const total = subsAll.length;
  const totalCur = subsCur.length;
  const completionRate = startsCur.length ? Math.round((totalCur/startsCur.length)*100) : 0;
  const avgTime = subsCur.length ? Math.round(subsCur.reduce((a,b)=>a+(b.completionMs||0),0)/subsCur.length/1000) : 0;
  const uniqueLogged = new Set(subsAll.filter(s=>s.user_id).map(s=>s.user_id)).size;

  const trendDays = 14;
  const today = new Date(); today.setHours(0,0,0,0);
  const trend = [];
  for(let i=trendDays-1;i>=0;i--){
    const d = new Date(today); d.setDate(today.getDate()-i);
    const start = d.getTime();
    const end = start + 86400000;
    const c = subsAll.filter(s=>s.createdAt>=start && s.createdAt<end).length;
    trend.push({date:d.toLocaleDateString(), count:c});
  }
  const maxTrend = Math.max(1,...trend.map(t=>t.count));

  const cards = [];
  cards.push(`
    <div class="analytics-card analytics-grid">
      <div><b>Total submissions (all versions)</b><div>${total}</div></div>
      <div><b>Total submissions (current version)</b><div>${totalCur}</div></div>
      <div><b>Completion rate (current)</b><div>${completionRate}%</div></div>
      <div><b>Avg completion time (current)</b><div>${avgTime}s</div></div>
      <div><b>Unique logged-in respondents</b><div>${uniqueLogged}</div></div>
    </div>
  `);

  // Only show submission trends if there are submissions
  if(subsAll.length > 0){
  cards.push(`
    <div class="analytics-card">
      <b>Submission trends (last 14 days)</b>
      ${trend.map(t=>`
        <div class="small">
          ${t.date} — ${t.count}
          <div class="trend-bar" style="width:${(t.count/maxTrend)*100}%"></div>
        </div>
      `).join("")}
    </div>
  `);
  }

  currentForm.fields.forEach(f=>{
    const fieldSubs = subsAll.map(s=>s.data[f.id]).filter(v=>v!=null);

    if(["dropdown","boolean","ratingStars"].includes(f.type)){
      const counts = {};
      fieldSubs.forEach(v=>{ counts[v]=(counts[v]||0)+1; });
      const rows = Object.entries(counts).map(([k,v])=>`<div>${esc(k||"(empty)")}: ${v}</div>`).join("");
      const avg = f.type==="ratingStars" ? average(fieldSubs.map(Number)).toFixed(2) : null;
      cards.push(`<div class="analytics-card"><b>${esc(f.label||prettyType(f.type))}</b>${avg!==null?`<div class="small subtle">Average: ${avg}</div>`:""}${rows||"<div class='subtle'>No data</div>"}</div>`);
    }

    if(f.type==="checkboxes"){
      const counts = {};
      fieldSubs.forEach(arr=>{
        (arr||[]).forEach(v=>{ counts[v]=(counts[v]||0)+1; });
      });
      const rows = Object.entries(counts).map(([k,v])=>`<div>${esc(k||"(empty)")}: ${v}</div>`).join("");
      cards.push(`<div class="analytics-card"><b>${esc(f.label||prettyType(f.type))}</b>${rows||"<div class='subtle'>No data</div>"}</div>`);
    }

    if(["text","email","phoneIQ"].includes(f.type)){
      const texts = fieldSubs.map(v=>String(v||"").trim()).filter(Boolean);
      const avgLen = texts.length ? Math.round(texts.reduce((a,b)=>a+b.length,0)/texts.length) : 0;
      const freq = {};
      texts.forEach(t=>{ const k=t.toLowerCase(); freq[k]=(freq[k]||0)+1; });
      const top = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5);
      cards.push(`<div class="analytics-card"><b>${esc(f.label||prettyType(f.type))}</b><div class="small subtle">Avg length: ${avgLen}</div>${top.length?top.map(([k,v])=>`<div>${esc(k)} — ${v}</div>`).join(""):"<div class='subtle'>No data</div>"}</div>`);
    }

    if(["number","range"].includes(f.type)){
      const nums = fieldSubs.map(Number).filter(n=>!Number.isNaN(n));
      if(nums.length){
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        const avg = average(nums).toFixed(2);
        const buckets = bucketize(nums, 5);
        cards.push(`<div class="analytics-card"><b>${esc(f.label||prettyType(f.type))}</b><div class="small subtle">Avg: ${avg} | Min: ${min} | Max: ${max}</div>${buckets.map(b=>`<div>${b.label}: ${b.count}</div>`).join("")}</div>`);
      }else{
        cards.push(`<div class="analytics-card"><b>${esc(f.label||prettyType(f.type))}</b><div class="subtle">No data</div></div>`);
      }
    }
  });

  analyticsBody.innerHTML = cards.join("");
  analyticsModal.classList.add("show");
}
function average(arr){ return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }
function bucketize(nums, k){
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const step = (max-min)/k || 1;
  const buckets = Array.from({length:k},(_,i)=>({from:min+i*step,to:min+(i+1)*step,count:0}));
  nums.forEach(n=>{
    let idx = Math.floor((n-min)/step);
    if(idx>=k) idx=k-1;
    buckets[idx].count++;
  });
  return buckets.map(b=>({label:`${b.from.toFixed(1)}–${b.toFixed(1)}`,count:b.count}));
}

function closeAnalyticsModal(){
  analyticsModal.classList.remove("show");
  analyticsModal.setAttribute("aria-hidden","true");
}

analyticsBtn.addEventListener("click",()=>{
  openDashboard().catch(err => {
    console.error("Error opening dashboard:", err);
    showToast("Failed to load analytics");
  });
});
if(closeAnalytics) closeAnalytics.addEventListener("click",closeAnalyticsModal);
if(closeAnalytics2) closeAnalytics2.addEventListener("click",closeAnalyticsModal);

if(analyticsModal) {
  analyticsModal.addEventListener("click",(e)=>{
    if(e.target === analyticsModal) closeAnalyticsModal();
  });
}

async function openHistory(){
  const me = getCurrentUserProfile();
  if(!me) return showToast("Login first");
  
  let subs = [];
  let allForms = [];
  
  // Try API first
  if (api && api.getToken && api.getToken() && api.getMySubmissions) {
    try {
      subs = await api.getMySubmissions();
      allForms = await api.getForms();
      // Convert to local format
      subs = subs.map(s => ({
        versionId: s.versionId,
        user_id: me.id,
        data: s.data,
        completionMs: s.completionMs,
        createdAt: new Date(s.createdAt).getTime()
      })).sort((a,b)=>b.createdAt-a.createdAt);
    } catch (error) {
      console.error("API history failed, using local storage:", error);
      subs = getSubs().filter(s=>s.user_id===me.id).sort((a,b)=>b.createdAt-a.createdAt);
      allForms = getForms();
    }
  } else {
    subs = getSubs().filter(s=>s.user_id===me.id).sort((a,b)=>b.createdAt-a.createdAt);
    allForms = getForms();
  }
  
  historyBody.innerHTML = subs.length ? subs.map(s=>{
    const form = allForms.find(f=>f.versionId===s.versionId);
    const title = form?.title || "Untitled form";
    return `<div class="analytics-card"><b>${esc(title)}</b><div class="small subtle">${new Date(s.createdAt).toLocaleString()}</div><div class="small">Completion: ${Math.round((s.completionMs||0)/1000)}s</div></div>`;
  }).join("") : `<div class="analytics-card subtle">No submissions yet.</div>`;
  historyModal.classList.add("show");
}

function closeHistoryModal(){
  historyModal.classList.remove("show");
  historyModal.setAttribute("aria-hidden","true");
}

historyBtn.addEventListener("click",openHistory);
if(closeHistory) closeHistory.addEventListener("click",closeHistoryModal);
if(closeHistory2) closeHistory2.addEventListener("click",closeHistoryModal);

if(historyModal) {
  historyModal.addEventListener("click",(e)=>{
    if(e.target === historyModal) closeHistoryModal();
  });
}

async function loadPublishedFromUrl(){
  const params=new URLSearchParams(location.search);
  const vid=params.get("form");
  if(!vid) return false;

  // Try API first
  if (api.getToken() && vid) {
    try {
      const form = await api.getForm(vid);
      if (!form || !form.published) {
        showToast("Form not found or not published");
        go("home");
        return true;
      }
      currentForm = {
        formId: form.formId,
        version: form.version,
        versionId: form.versionId,
        ownerEmail: currentOwnerEmail,
        title: form.title,
        fields: form.fields || [],
        settings: form.settings || {},
        published: form.published,
        publishedAt: form.published ? Date.now() : null,
        createdAt: new Date(form.createdAt).getTime(),
        updatedAt: new Date(form.updatedAt).getTime()
      };
      structuralDirty=false;
      renderBuilder();
      go("builder");
      openPreview();
      return true;
    } catch (error) {
      console.error("API load failed, trying local storage:", error);
    }
  }

  // Fallback to local storage
  const form=getForms().find(f=>f.versionId===vid && f.publishedAt);
  if(!form){
    showToast("Form not found");
    go("home");
    return true;
  }
  currentForm=form;
  structuralDirty=false;
  renderBuilder();
  go("builder");
  openPreview();
  return true;
}

function esc(str){
  return String(str??"").replace(/[&<>"']/g,s=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[s]));
}

if(auth && typeof onAuthStateChanged === 'function') {
  onAuthStateChanged(auth,(user)=>{
    currentOwnerEmail=user?.email||"guest";
    if(currentOwnerEmail!=="guest") ensureUserProfile(currentOwnerEmail);

    const me = getCurrentUserProfile();
    if(userEmailEl) userEmailEl.textContent=currentOwnerEmail || "Guest";
    if(userAvatarEl) userAvatarEl.textContent=user?currentOwnerEmail[0].toUpperCase():"👤";
    if(userRoleEl) userRoleEl.textContent=me?.role||"Editor";

    renderSavedForms();
    updateDashboardStats();
    if(!currentForm) newForm(currentOwnerEmail);
  }, (error) => {
    console.error("Auth state error:", error);
  });
} else {
  // Fallback for when Firebase is not configured
  currentOwnerEmail = "guest";
  if(userEmailEl) userEmailEl.textContent = "Guest";
  if(userAvatarEl) userAvatarEl.textContent = "👤";
  if(userRoleEl) userRoleEl.textContent = "Guest";
  if(!currentForm) newForm("guest");
}

newForm("guest");

// Add animated borders to some elements
function addAnimatedBorders(){
  // Don't add animated-border to features - they should all look the same
  // Don't add animated-border to showcase cards - they should all look the same
  
  // Add to some saved forms (every other one)
  const savedForms = document.querySelectorAll('.saved-form');
  savedForms.forEach((f, i) => {
    if(i % 2 === 0) f.classList.add('animated-border');
  });
  
  // Add to some q-cards (every 3rd one)
  const qCards = document.querySelectorAll('.q-card');
  qCards.forEach((c, i) => {
    if(i % 3 === 0) c.classList.add('animated-border');
  });
  
  // Add to settings
  const settings = document.querySelector('.settings');
  if(settings) settings.classList.add('animated-border');
  
  // Add to some analytics cards
  const analyticsCards = document.querySelectorAll('.analytics-card');
  analyticsCards.forEach((c, i) => {
    if(i % 2 === 0) c.classList.add('animated-border');
  });
}

// Run after DOM is ready
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', addAnimatedBorders);
} else {
  addAnimatedBorders();
}

// Re-run when views change
const observer = new MutationObserver(() => {
  setTimeout(addAnimatedBorders, 100);
});
observer.observe(document.body, { childList: true, subtree: true });

// Load published form from URL if present
loadPublishedFromUrl().then(handledPublished => {
if(!handledPublished){
  const r=currentRouteFromHash();
  go(r,false);
  }
}).catch(err => {
  console.error("Error loading published form:", err);
  const r=currentRouteFromHash();
  go(r,false);
});

// Scroll-triggered visibility for sections
let scrollObserver = null;

function initScrollVisibility(){
  if(scrollObserver) {
    scrollObserver.disconnect();
  }
  
  const sections = document.querySelectorAll('.features, .showcase, .stats-section, .testimonials-section, .cta-section');
  if(sections.length === 0) return;
  
  // Start all hidden (but don't remove if already visible)
  sections.forEach(section => {
    if(!section.classList.contains('visible')) {
      section.classList.remove('visible');
    }
  });
  
  // Function to check and show sections when scrolled into view
  function checkAndShow() {
    const viewportHeight = window.innerHeight;
    sections.forEach(section => {
      // Once visible, keep it visible (don't check again)
      if (section.classList.contains('visible')) return;
      
      const rect = section.getBoundingClientRect();
      // Show when section top is within viewport (with 150px margin for early trigger)
      if (rect.top < viewportHeight - 150 && rect.bottom > -50) {
        section.classList.add('visible');
      }
    });
  }
  
  // IntersectionObserver - shows sections when they enter viewport
  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting && !entry.target.classList.contains('visible')) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });
  
  // Observe all sections
  sections.forEach(section => {
    scrollObserver.observe(section);
  });
  
  // Scroll event listener as backup
  const scrollHandler = () => {
    requestAnimationFrame(checkAndShow);
  };
  window.addEventListener('scroll', scrollHandler, { passive: true });
  
  // Initial check
  checkAndShow();
  setTimeout(checkAndShow, 100);
  setTimeout(checkAndShow, 300);
}

// Initialize
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initScrollVisibility);
} else {
  initScrollVisibility();
}

// Re-initialize when home view becomes active
const homeView = document.getElementById('home');
if(homeView) {
  const viewObserver = new MutationObserver(() => {
    if(homeView.classList.contains('active')) {
      setTimeout(initScrollVisibility, 100);
    }
  });
  viewObserver.observe(homeView, { attributes: true, attributeFilter: ['class'] });
}

const resetFake=document.getElementById("resetFake");
if(resetFake){
  resetFake.addEventListener("click",(e)=>{
    e.preventDefault();
    showToast("Reset via email not added");
  });
}

// Dashboard functionality
const dashboardFormsBtn = document.getElementById("dashboardFormsBtn");
const dashboardAnalyticsBtn = document.getElementById("dashboardAnalyticsBtn");
const dashboardHistoryBtn = document.getElementById("dashboardHistoryBtn");
const totalFormsCount = document.getElementById("totalFormsCount");
const totalSubmissionsCount = document.getElementById("totalSubmissionsCount");
const publishedFormsCount = document.getElementById("publishedFormsCount");


if(dashboardFormsBtn){
  dashboardFormsBtn.addEventListener("click", ()=>{
    go("builder");
    if(loadFormsBtn) loadFormsBtn.click();
  });
}

if(dashboardAnalyticsBtn){
  dashboardAnalyticsBtn.addEventListener("click", ()=>{
    go("builder");
    if(analyticsBtn) analyticsBtn.click();
  });
}

if(dashboardHistoryBtn){
  dashboardHistoryBtn.addEventListener("click", ()=>{
    go("builder");
    if(historyBtn) historyBtn.click();
  });
}

// Update stats when dashboard is viewed
const dashboardView = document.getElementById("dashboard");
if(dashboardView){
  const dashboardObserver = new MutationObserver(() => {
    if(dashboardView.classList.contains("active")){
      updateDashboardStats();
    }
  });
  dashboardObserver.observe(dashboardView, { attributes: true, attributeFilter: ['class'] });
}
