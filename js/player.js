$(document).ready(function () {
    const audio = $('.audio')[0];
    let isPlaying = false;

    function loadTrack(index) {
        const track = $('.playlist li').eq(index);
        $('.playlist li').removeClass('is_active');
        track.addClass('is_active');
        audio.src = track.data('src');
        $('.current-name').text(track.find('.s-name').text());
        $('.current-author').text(track.find('.s-author').text());
        $('.current-cover').attr('src', track.find('.s-cover').attr('src'));
        $('.player-download').attr('download', track.find('.s-author').text() + ' ' + track.find('.s-name').text());
        $('.player-download').attr('href', track.data('src'));
        audio.load();
        if (isPlaying) audio.play();
    }

    function togglePlay() {
        if (audio.paused) {
            audio.play();
            isPlaying = true;
            $('.player-pause').addClass('is_active');
        } else {
            audio.pause();
            isPlaying = false;
            $('.player-pause').removeClass('is_active');
        }
    }

    function updateProgress(e) {
        const { currentTime, duration } = e.target;
        const percent = (currentTime / duration) * 100;
        $('.progress-bar span').css('width', `${percent}%`);
    }

    function setProgress(e) {
        const progressWidth = $(this).width();
        const offsetX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (offsetX / progressWidth) * duration;
    }

    let currentTrack = 0;
    loadTrack(currentTrack);

    $('.player-pause').click(togglePlay);

    $('.player-prev').click(function () {
        currentTrack = (currentTrack > 0) ? currentTrack - 1 : $('.playlist li').length - 1;
        loadTrack(currentTrack);
    });

    $('.player-next').click(function () {
        currentTrack = (currentTrack < $('.playlist li').length - 1) ? currentTrack + 1 : 0;
        loadTrack(currentTrack);
    });

    $('.playlist li').click(function () {
        currentTrack = $(this).index();
        loadTrack(currentTrack);
        audio.play();
        isPlaying = true;
        $('.player-pause').addClass('is_active');
    });

    audio.addEventListener('timeupdate', updateProgress);

    $('.progress-bar').click(setProgress);

    audio.addEventListener('ended', function () {
        $('.player-next').click();
    });
});