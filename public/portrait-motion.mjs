// Analytic critically damped spring: preserves position and velocity on reversal.
export function advancePortrait(state,target,seconds){
 const dt=Math.max(0,Math.min(seconds,.05)),omega=target?17:23;
 const offset=state.position-target,c=state.velocity+omega*offset,decay=Math.exp(-omega*dt);
 let position=target+(offset+c*dt)*decay,velocity=(state.velocity-omega*c*dt)*decay;
 if(position<0){position=0;velocity=0}if(position>1){position=1;velocity=0}
 const settled=Math.abs(position-target)<.001&&Math.abs(velocity)<.035;
 return settled?{position:target,velocity:0,settled:true}:{position,velocity,settled:false};
}
