export const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
export function fitBox(box,viewport,padding=60,maxScale=2){
 const scale=Math.min((viewport.width-padding*2)/box.width,(viewport.height-padding*2)/box.height,maxScale);
 return {scale,x:viewport.width/2-(box.x+box.width/2)*scale,y:viewport.height/2-(box.y+box.height/2)*scale};
}
export function zoomAt(state,factor,point,min,max){
 const scale=clamp(state.scale*factor,min,max),ratio=scale/state.scale;
 return {scale,x:point.x-(point.x-state.x)*ratio,y:point.y-(point.y-state.y)*ratio};
}
export function constrain(state,bounds,viewport){
 const marginX=Math.min(80,viewport.width*.15),marginY=Math.min(80,viewport.height*.15);
 return {...state,x:clamp(state.x,marginX-(bounds.x+bounds.width)*state.scale,viewport.width-marginX-bounds.x*state.scale),y:clamp(state.y,marginY-(bounds.y+bounds.height)*state.scale,viewport.height-marginY-bounds.y*state.scale)};
}
