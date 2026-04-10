class AdminPanel{
    constructor(){
        this.totalSessionsEl=document.getElementById('totalSessions');
        this.totalTimeEl=document.getElementById('totalTime');
        this.mostPopularEl=document.getElementById('mostPopular');
        this.activityTableEl=document.getElementById('activityTable');
        this.recentActivityEl=document.getElementById('recentActivity');
        this.clearBtn=document.getElementById('clearData');
        this.init();
    }
    
    init(){
        this.loadAnalytics();
        this.clearBtn.addEventListener('click',()=>this.showClearConfirmation());
    }
    
    showClearConfirmation(){
        const modal=document.createElement('div');
        modal.className='confirm-modal';
        modal.innerHTML=`
            <div class="confirm-modal-content">
                <h2>⚠️ Clear All Data?</h2>
                <p>Are you sure you want to delete all analytics data?<br>This action cannot be undone!</p>
                <div class="confirm-buttons">
                    <button class="confirm-btn-yes" id="confirmYes">🗑️ Yes, Clear All</button>
                    <button class="confirm-btn-no" id="confirmNo">❌ Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('confirmYes').addEventListener('click',()=>{
            localStorage.removeItem('game_analytics');
            modal.remove();
            this.showSuccessMessage('All data cleared successfully!');
            setTimeout(()=>location.reload(),1500);
        });
        
        document.getElementById('confirmNo').addEventListener('click',()=>{
            modal.remove();
        });
    }
    
    showSuccessMessage(text){
        const msg=document.createElement('div');
        msg.className='success-toast';
        msg.textContent=text;
        document.body.appendChild(msg);
        setTimeout(()=>msg.remove(),3000);
    }
    
    loadAnalytics(){
        const analytics=JSON.parse(localStorage.getItem('game_analytics')||'{"pages":{},"sessions":[]}');
        this.displayOverview(analytics);
        this.displayPageActivity(analytics);
        this.displayRecentActivity(analytics);
    }
    
    displayOverview(analytics){
        const totalSessions=analytics.sessions.length;
        const totalTime=analytics.sessions.reduce((sum,s)=>sum+(s.duration||0),0);
        const mostVisited=Object.entries(analytics.pages||{}).sort((a,b)=>(b[1].visits||0)-(a[1].visits||0))[0];
        
        this.totalSessionsEl.textContent=totalSessions;
        this.totalTimeEl.textContent=this.formatTime(totalTime);
        this.mostPopularEl.textContent=mostVisited?this.formatPageName(mostVisited[0]):'-';
    }
    
    displayPageActivity(analytics){
        this.activityTableEl.innerHTML='';
        const pages=analytics.pages||{};
        Object.entries(pages).sort((a,b)=>(b[1].visits||0)-(a[1].visits||0)).forEach(([page,data])=>{
            const row=document.createElement('tr');
            const avgTime=(data.visits||0)>0?(data.totalTime||0)/(data.visits||1):0;
            row.innerHTML=`
                <td>${this.formatPageName(page)}</td>
                <td>${data.visits||0}</td>
                <td>${this.formatTime(data.totalTime||0)}</td>
                <td>${this.formatTime(avgTime)}</td>
            `;
            this.activityTableEl.appendChild(row);
        });
    }
    
    displayRecentActivity(analytics){
        this.recentActivityEl.innerHTML='';
        const sessions=analytics.sessions||[];
        sessions.slice(-10).reverse().forEach(session=>{
            const item=document.createElement('div');
            item.className='activity-item';
            const date=new Date(session.timestamp||Date.now());
            item.innerHTML=`
                <div class="activity-time">${date.toLocaleString()}</div>
                <div class="activity-page">${this.formatPageName(session.page||'unknown')}</div>
                <div class="activity-duration">Duration: ${this.formatTime(session.duration||0)}</div>
            `;
            this.recentActivityEl.appendChild(item);
        });
    }
    
    formatPageName(page){
        const names={'index':'Home Page','tic-tac-toe':'Tic-Tac-Toe','mines':'Mines','rock-paper-scissors':'Rock-Paper-Scissors','tetris':'Tetris','statistics':'Statistics'};
        return names[page]||page;
    }
    
    formatTime(seconds){
        if(seconds<60)return`${Math.round(seconds)}s`;
        const mins=Math.floor(seconds/60);
        const secs=Math.round(seconds%60);
        return secs>0?`${mins}m ${secs}s`:`${mins}m`;
    }
}

class AnalyticsTracker{
    constructor(){
        this.currentPage=this.getCurrentPage();
        this.startTime=Date.now();
        this.init();
    }
    
    init(){
        this.trackPageView();
        window.addEventListener('beforeunload',()=>this.trackPageExit());
    }
    
    getCurrentPage(){
        const path=window.location.pathname;
        const page=path.split('/').pop().replace('.html','');
        return page||'index';
    }
    
    trackPageView(){
        try{
            const analytics=JSON.parse(localStorage.getItem('game_analytics')||'{"pages":{},"sessions":[]}');
            if(!analytics.pages)analytics.pages={};
            if(!analytics.sessions)analytics.sessions=[];
            
            if(!analytics.pages[this.currentPage]){
                analytics.pages[this.currentPage]={visits:0,totalTime:0};
            }
            analytics.pages[this.currentPage].visits++;
            
            localStorage.setItem('game_analytics',JSON.stringify(analytics));
        }catch(e){console.log('Analytics:',e)}
    }
    
    trackPageExit(){
        try{
            const duration=(Date.now()-this.startTime)/1000;
            const analytics=JSON.parse(localStorage.getItem('game_analytics')||'{"pages":{},"sessions":[]}');
            
            if(!analytics.pages)analytics.pages={};
            if(!analytics.sessions)analytics.sessions=[];
            
            if(analytics.pages[this.currentPage]){
                analytics.pages[this.currentPage].totalTime=(analytics.pages[this.currentPage].totalTime||0)+duration;
            }
            
            analytics.sessions.push({page:this.currentPage,timestamp:new Date().toISOString(),duration:duration});
            
            if(analytics.sessions.length>100)analytics.sessions=analytics.sessions.slice(-100);
            
            localStorage.setItem('game_analytics',JSON.stringify(analytics));
        }catch(e){console.log('Analytics:',e)}
    }
}

document.addEventListener('DOMContentLoaded',()=>{
    if(window.location.pathname.includes('statistics')){
        new AdminPanel();
    }else{
        new AnalyticsTracker();
    }
});
