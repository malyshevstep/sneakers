$(document).ready(function() {
    $('.page-header__burger').click(function(){
        $('.page-header__burger').toggleClass('open-menu');
        $('.page-header__nav').toggleClass('open-menu');
        $('body').toggleClass('fixed-page');
    });
});