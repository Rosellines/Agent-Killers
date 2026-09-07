export class RemoteExecutionGate {
  constructor({maxActive=4,maxQueued=32,maxActivePerCaller=2}={}) {
    if(!Number.isInteger(maxActive)||maxActive<1) throw new Error('maxActive must be a positive integer');
    if(!Number.isInteger(maxQueued)||maxQueued<0) throw new Error('maxQueued must be a non-negative integer');
    if(!Number.isInteger(maxActivePerCaller)||maxActivePerCaller<1) throw new Error('maxActivePerCaller must be a positive integer');
    this.maxActive=maxActive; this.maxQueued=maxQueued; this.maxActivePerCaller=maxActivePerCaller;
    this.active=0; this.queue=[]; this.activeByCaller=new Map();
  }
  queuedCount(){ return this.queue.length; }
  activeCount(){ return this.active; }
  activeFor(caller){ return this.activeByCaller.get(caller)||0; }
  tryEnqueue(caller,task){
    if(this.activeFor(caller)>=this.maxActivePerCaller) return {accepted:false,reason:'caller_concurrency_limit'};
    if(this.queue.length>=this.maxQueued && this.active>=this.maxActive) return {accepted:false,reason:'execution_queue_full'};
    const item={caller,task};
    if(this.active<this.maxActive){ this.#start(item); return {accepted:true,started:true}; }
    this.queue.push(item); return {accepted:true,started:false};
  }
  #start(item){ this.active++; this.activeByCaller.set(item.caller,this.activeFor(item.caller)+1); Promise.resolve().then(()=>item.task.run()).finally(()=>this.#finish(item)); }
  #finish(item){
    this.active=Math.max(0,this.active-1); const nextCount=Math.max(0,this.activeFor(item.caller)-1); if(nextCount) this.activeByCaller.set(item.caller,nextCount); else this.activeByCaller.delete(item.caller); this.#drain();
  }
  #drain(){
    while(this.active<this.maxActive && this.queue.length){
      let idx=-1;
      for(let i=0;i<this.queue.length;i++){ const item=this.queue[i]; if(this.activeFor(item.caller)<this.maxActivePerCaller){idx=i;break;} }
      if(idx<0) return;
      const [item]=this.queue.splice(idx,1); this.#start(item);
    }
  }
  cancelQueued(jobId){
    const idx=this.queue.findIndex(x=>x.task.jobId===jobId); if(idx<0) return false; this.queue.splice(idx,1); return true;
  }
  snapshot(){ return {active:this.active,queued:this.queue.length,maxActiveJobs:this.maxActive,maxQueuedJobs:this.maxQueued,maxActiveJobsPerCaller:this.maxActivePerCaller}; }
}
