# snippet_registry.py
"""
Static code snippet registry for 20 GDPR/CCPA violations.
Each entry provides both an HTML and React fix example.
"""

FIX_SNIPPETS = {
    "missing_consent_banner": {
        "title": "Add a Cookie Consent Banner",
        "html": """<div id="cookie-banner" role="dialog">
  <p>We use cookies to improve your experience. <a href="/privacy">Privacy Policy</a></p>
  <button id="accept">Accept</button>
  <button id="reject">Reject</button>
</div>
<script>
document.getElementById('accept').onclick = ()=>{localStorage.setItem('cookie-consent','accepted');document.getElementById('cookie-banner').remove();}
document.getElementById('reject').onclick = ()=>{localStorage.setItem('cookie-consent','rejected');document.getElementById('cookie-banner').remove();}
</script>""",
        "react": """import React from 'react';
export default function CookieConsent(){
  const accept=()=>{localStorage.setItem('cookie-consent','accepted');};
  const reject=()=>{localStorage.setItem('cookie-consent','rejected');};
  return(<div className='fixed bottom-4 p-4 bg-gray-900 text-white rounded'>
    <p>We use cookies. <a href='/privacy'>Privacy Policy</a></p>
    <button onClick={accept}>Accept</button>
    <button onClick={reject}>Reject</button>
  </div>);
}"""
    },
    "no_reject_option": {
        "title": "Add a Reject Button in Consent UI",
        "html": """<div id="cookie-banner">
  <p>We use cookies for analytics.</p>
  <button>Accept</button>
  <button>Reject</button>
  <a href="/cookie-preferences">Manage</a>
</div>""",
        "react": """export default function ConsentUI(){
  return(<div>
    <p>We use cookies for analytics.</p>
    <button>Accept</button>
    <button>Reject</button>
    <a href='/cookie-preferences'>Manage</a>
  </div>);
}"""
    },
    "cookies_before_consent": {
        "title": "Delay Cookie Loading Until Consent",
        "html": """<script>
function loadAnalytics(){
 if(localStorage.getItem('cookie-consent')==='accepted'){
   const s=document.createElement('script');
   s.src='https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
   document.head.appendChild(s);
 }
}
</script>""",
        "react": """export function loadAnalyticsIfConsent(){
 if(localStorage.getItem('cookie-consent')==='accepted'){
   const s=document.createElement('script');
   s.src='https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
   document.head.appendChild(s);
 }
}"""
    },
    "insecure_cookies": {
        "title": "Use Secure and HttpOnly Cookies",
        "html": """<!-- Fix server-side cookies configuration -->
<!-- Example: Set-Cookie: id=abc; Secure; HttpOnly; SameSite=Strict -->""",
        "react": """// Server fix (Express example)
res.cookie('session_id', token, {secure:true, httpOnly:true, sameSite:'Strict'});"""
    },
    "missing_privacy_policy": {
        "title": "Add a Privacy Policy Link",
        "html": """<footer><a href="/privacy">Privacy Policy</a></footer>""",
        "react": """export default function Footer(){return(<footer><a href='/privacy'>Privacy Policy</a></footer>);}"""
    },
    "missing_do_not_sell": {
        "title": "Add 'Do Not Sell My Info' Link",
        "html": """<footer><a href="/do-not-sell">Do Not Sell My Personal Information</a></footer>""",
        "react": """export default function DoNotSell(){return(<a href='/do-not-sell'>Do Not Sell My Personal Information</a>);}"""
    },
    "third_party_trackers": {
        "title": "Load Third-Party Trackers After Consent",
        "html": """<script>
function loadTracker(src){
 if(localStorage.getItem('cookie-consent')==='accepted'){
   const s=document.createElement('script');s.src=src;document.head.appendChild(s);
 }
}
</script>""",
        "react": """export function loadTracker(src:string){
 if(localStorage.getItem('cookie-consent')==='accepted'){
   const s=document.createElement('script');s.src=src;document.head.appendChild(s);
 }
}"""
    },
    "fingerprinting": {
        "title": "Disable Browser Fingerprinting",
        "html": """<!-- Remove FingerprintJS or WebGL fingerprint scripts -->""",
        "react": """console.warn("Avoid using browser fingerprinting scripts.");"""
    },
    "local_storage_use": {
        "title": "Avoid Unconsented LocalStorage Usage",
        "html": """<script>
if(!localStorage.getItem('cookie-consent')){localStorage.clear();}
</script>""",
        "react": """export function safeStorage(key:string,val:string){
 if(localStorage.getItem('cookie-consent')==='accepted'){
   localStorage.setItem(key,val);
 }
}"""
    },
    "missing_data_access_option": {
        "title": "Add 'Request My Data' Form",
        "html": """<form action="/requests/access" method="post">
 <input type="email" name="email" placeholder="Email" required>
 <button type="submit">Request My Data</button>
</form>""",
        "react": """export default function DataAccessForm(){
 return(<form action='/requests/access' method='post'>
   <input name='email' required placeholder='Email'/>
   <button>Request My Data</button>
 </form>);
}"""
    },
    "missing_data_deletion": {
        "title": "Add 'Delete My Data' Form",
        "html": """<form action="/requests/delete" method="post">
 <input type="email" name="email" required placeholder="Email">
 <button type="submit">Delete My Data</button>
</form>""",
        "react": """export default function DataDeleteForm(){
 return(<form action='/requests/delete' method='post'>
   <input name='email' required placeholder='Email'/>
   <button>Delete My Data</button>
 </form>);
}"""
    },
    "missing_retention_policy": {
        "title": "Add Data Retention Statement",
        "html": """<section><h3>Data Retention</h3>
<p>We keep user data for 24 months or until deletion request.</p></section>""",
        "react": """export default function RetentionInfo(){
 return(<section><h3>Data Retention</h3>
 <p>We retain data for 24 months after last use.</p></section>);
}"""
    },
    "missing_withdraw_consent": {
        "title": "Add 'Manage Consent' Option",
        "html": """<a href="/privacy#manage">Manage Consent</a>""",
        "react": """export default function ManageConsentLink(){
 return(<a href='/privacy#manage'>Manage Consent</a>);
}"""
    },
    "collecting_pii": {
        "title": "Request PII with Consent",
        "html": """<form>
 <label>Email<input name="email" type="email" required></label>
 <label><input type="checkbox" name="consent" required> I consent</label>
 <button>Submit</button>
</form>""",
        "react": """export default function Signup(){
 return(<form>
 <label>Email<input type='email' required/></label>
 <label><input type='checkbox' required/>I consent</label>
 <button>Submit</button>
 </form>);
}"""
    },
    "email_marketing_without_consent": {
        "title": "Add Consent Checkbox to Newsletter",
        "html": """<form>
 <input name="email" type="email" required placeholder="Email">
 <label><input type="checkbox" required> I consent to marketing emails</label>
 <button>Subscribe</button>
</form>""",
        "react": """export default function NewsletterForm(){
 return(<form>
 <input name='email' type='email' required placeholder='Email'/>
 <label><input type='checkbox' required/>I consent to receive emails</label>
 <button>Subscribe</button>
 </form>);
}"""
    },
    "dark_pattern_consent_ui": {
        "title": "Ensure Neutral Consent UI",
        "html": """<div>
 <button id="accept">Accept</button>
 <button id="reject">Reject</button>
</div>""",
        "react": """export default function NeutralUI(){
 return(<div><button>Accept</button><button>Reject</button></div>);
}"""
    },
    "insecure_transport": {
        "title": "Force HTTPS Transport",
        "html": """<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">""",
        "react": """export const enforceHttps=`app.use((req,res,next)=>{if(!req.secure)return res.redirect('https://'+req.headers.host+req.url);next();});`;"""
    },
    "third_party_data_sharing": {
        "title": "Disclose Third-Party Processors",
        "html": """<section>
 <h3>Third-Party Processors</h3>
 <p>We share limited data with analytics.example.com under DPA.</p>
</section>""",
        "react": """export default function ThirdPartyDisclosure(){
 return(<section><h3>Third-Party Processors</h3><p>We share data with analytics.example.com under DPA.</p></section>);
}"""
    },
    "analytics_without_anonymization": {
        "title": "Enable IP Anonymization in Analytics",
        "html": """<script>
gtag('config', 'GA_MEASUREMENT_ID', {'anonymize_ip': true});
</script>""",
        "react": """export const gaAnonymizeExample=`gtag('config','GA_MEASUREMENT_ID',{'anonymize_ip':true});`;"""
    },
    "excessive_cookie_count": {
        "title": "Reduce Cookie Count",
        "html": """<p>Audit cookies, remove duplicates, and consolidate trackers.</p>""",
        "react": """export default function CookieAuditNote(){
 return(<p>Audit and reduce non-essential cookies.</p>);
}"""
    }
}
