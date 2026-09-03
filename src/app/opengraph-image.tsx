import { ImageResponse } from "next/og";

export const alt = "Federal Signal — Government R&D as venture signal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"64px",color:"#0b1933",background:"#f4f1ea",fontFamily:"Arial, sans-serif"}}>
      <div style={{display:"flex",alignItems:"center",gap:"18px",fontSize:26,fontWeight:700}}>
        <div style={{width:58,height:58,display:"flex",alignItems:"center",justifyContent:"center",color:"white",background:"#1752d6",fontSize:18}}>FS</div>
        Federal Signal
      </div>
      <div style={{display:"flex",flexDirection:"column",width:"94%"}}>
        <div style={{marginBottom:24,color:"#1752d6",fontSize:18,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>Venture sourcing from public signal</div>
        <div style={{fontSize:76,fontWeight:650,lineHeight:.98,letterSpacing:"-0.055em"}}>Government R&amp;D is an underpriced venture signal.</div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",paddingTop:24,borderTop:"2px solid #0b1933",color:"#60697a",fontSize:18}}>
        <span>1,530 companies screened · 5 finalists</span><span>02 Sep 2026</span>
      </div>
    </div>,
    size,
  );
}
