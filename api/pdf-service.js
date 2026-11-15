export function pdfServiceConfig(env=process.env){
 if(!env.WJ_PDF_SERVER_URL)return {available:false,aiAvailable:false};
 try{const url=new URL(env.WJ_PDF_SERVER_URL);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw Error();return {available:true,baseUrl:url.origin,aiAvailable:env.WJ_PDF_AI_ENABLED==='true'};}catch{return {available:false,aiAvailable:false};}
}
export default function handler(req,res){res.setHeader('Cache-Control','no-store');if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Método não permitido.'});}return res.status(200).json(pdfServiceConfig());}
