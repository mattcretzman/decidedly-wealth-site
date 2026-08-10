/* Mobile nav — shared across all pages */
(function(){
  var nk=document.getElementById('nk');
  var btn=document.querySelector('.nt');
  if(!btn||!nk)return;
  btn.addEventListener('click',function(e){
    e.stopPropagation();
    nk.classList.toggle('open');
    document.querySelectorAll('.dd.open').forEach(function(d){d.classList.remove('open')});
  });
  document.querySelectorAll('.dd>a').forEach(function(a){
    a.addEventListener('click',function(e){
      if(window.innerWidth<=768){
        e.preventDefault();
        var parent=a.parentElement;
        document.querySelectorAll('.dd.open').forEach(function(d){if(d!==parent)d.classList.remove('open')});
        parent.classList.toggle('open');
      }
    });
  });
  document.addEventListener('click',function(e){
    if(window.innerWidth<=768 && nk.classList.contains('open') && !e.target.closest('nav')){
      nk.classList.remove('open');
      document.querySelectorAll('.dd.open').forEach(function(d){d.classList.remove('open')});
    }
  });
})();

/* Scroll nav + reveal animations */
window.addEventListener('scroll',function(){document.getElementById('nav').classList.toggle('s',scrollY>40)});
var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('v');o.unobserve(e.target)}})},{threshold:.08});
document.querySelectorAll('.r,.stages-head .ey,.intro .ey,.team .ey,.pod-text .ey,.cta-final .ey,.story-opening .ey').forEach(function(el){o.observe(el)});

/* Google Ads conversion tracking */
(function(){
  if(typeof gtag==='undefined')return;
  /* Contact form submissions */
  document.querySelectorAll('form').forEach(function(f){
    f.addEventListener('submit',function(){
      gtag('event','conversion',{'send_to':'AW-18360721058/XxZFCK3bqN8cEKK9ibNE'});
    });
  });
  /* Book download clicks */
  document.querySelectorAll('a[href*="books.html"],.book-dl,a[href*="book"]').forEach(function(a){
    if(a.textContent.match(/download|get.*free|get.*book/i)){
      a.addEventListener('click',function(){
        gtag('event','conversion',{'send_to':'AW-18360721058/Qbj3CLbbqN8cEKK9ibNE'});
      });
    }
  });
  /* Phone call clicks */
  document.querySelectorAll('a[href^="tel:"]').forEach(function(a){
    a.addEventListener('click',function(){
      gtag('event','conversion',{'send_to':'AW-18360721058/IfezCODhud8cEKK9ibNE'});
    });
  });
})();
