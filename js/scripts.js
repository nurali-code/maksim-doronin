$('.header-btn, .header-menu').on('click', function () {
	$('.header-btn, .header-menu, body').toggleClass('is_active')
})
$('[data-toggle]').on('click', function () {
	$('[data-toggle]').removeClass('is_active')
	$(this).addClass('is_active')
	$("[data-tab]").removeClass('is_active')
	$(`[data-tab="${$(this).data('toggle')}"]`).addClass('is_active')
})

function compensateForScrollbar() {
	var scrollbarWidth = window.innerWidth - $(document).width();
	if ($('body').hasClass('overflow')) { $('body').css('margin-right', '0'); }
	else if (scrollbarWidth > 0) { $('body').css('margin-right', scrollbarWidth + 'px'); }
}
function showModal(id) {
	compensateForScrollbar()
	$(id).fadeIn();
	$('body').addClass('overflow')
	const playlist = $('#music .playlist');
	playlist.animate({ scrollTop: playlist.scrollTop() + $('#music li.is_active').position().top }, 500);
}
function hideModals() {
	$('.modal').fadeOut();
	compensateForScrollbar()
	$('body').removeClass('overflow')
};

$(function () {
	$('a[href="#music"]').on('click', function (e) {
		e.preventDefault()
		showModal($(this).attr("href"));
	});
	$('.modal__close').on('click', () => {
		$('audio').each(function () { this.pause() })
		hideModals();
	});
	$(document).on('click', function (e) {
		if (!(
			($(e.target).parents('.modal-content').length) ||
			($(e.target).parents('.link').length) ||
			($(e.target).hasClass('link')) ||
			($(e.target).hasClass('modal-content'))
		) && $('body').hasClass('overflow')) { hideModals(); }
	});
});

$('.connect__btn').on('click', function () {
	$('.connect-box, .connect__btn').toggleClass('is_active')
})

$(document).on('click', function (e) {
	if (!(($(e.target).parents('.connect').length) ||
		($(e.target).hasClass('connect'))
	) && $('.connect__btn').hasClass('is_active')) { $('.connect-box, .connect__btn').toggleClass('is_active') }
});

$('[data-tab]').on('click', function () {
	$(this).addClass('is_active').siblings().removeClass('is_active');
	$('[data-id]').removeClass('is_active')
	$('[data-id="' + $(this).data('tab') + '"]').addClass('is_active')
})

$(window).scroll(function () {
	if ($(this).scrollTop() > 300) { $('.sroll_up').fadeIn(); }
	else { $('.sroll_up').fadeOut(); }
});