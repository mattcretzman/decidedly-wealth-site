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
