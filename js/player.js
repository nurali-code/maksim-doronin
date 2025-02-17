$(document).ready(function () {
    // Итерируем по каждому плееру на странице
    $('.player').each(function () {
        const player = $(this),
            audio = player.find('.audio')[0],
            playlist = player.find('.playlist li'),
            progressCurr = player.find('.progress-curr'),
            progressTot = player.find('.progress-tot');

        let isPlaying = false;
        let currentTrack = 0;

        const formatTime = (time) => {
            if (isNaN(time)) return '0:00';
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60).toString().padStart(2, '0');
            return `${minutes}:${seconds}`;
        };

        async function getAudioFileSize(url) {
            try {
                const response = await fetch(url, { method: 'HEAD' });
                const size = response.headers.get('Content-Length');
                return size ? (size / (1024 * 1024)).toFixed(2) + ' MB' : 'Неизвестно';
            } catch (error) {
                console.error('Ошибка получения размера файла:', error);
                return 'Ошибка';
            }
        }

        function loadTrack(index) {
            const track = playlist.eq(index);
            playlist.removeClass('is_active');
            track.addClass('is_active');
            const audioSrc = track.data('src');
            audio.src = audioSrc;

            player.find('.current-name').text(track.find('.s-name').text());
            player.find('.current-author').text(track.find('.s-author').text());
            player.find('.current-cover').attr('src', track.find('.s-cover').attr('src'));
            player.find('.player-download').attr('download', track.find('.s-author').text() + ' ' + track.find('.s-name').text());
            player.find('.player-download').attr('href', audioSrc);

            // Загружаем метаданные трека
            audio.load();
            audio.addEventListener('loadedmetadata', function () {
                player.find('.s-duration').text(formatTime(audio.duration));
            });

            // Получаем и отображаем размер файла
            getAudioFileSize(audioSrc).then(size => {
                player.find('.s-size').text(size);
            });

            if (isPlaying) {
                audio.play();
                player.find('.playlist li use').attr('xlink:href', '#play');
                player.find('.player-pause use, .playlist li.is_active use').attr('xlink:href', '#pause');
            }
        }

        function togglePlay() {
            if (audio.paused) {
                audio.play();
                isPlaying = true;
                player.find('.playlist li use').attr('xlink:href', '#play');
                player.find('.player-pause use, .playlist li.is_active use').attr('xlink:href', '#pause');
            } else {
                audio.pause();
                player.find('.player-pause use, .playlist li.is_active use').attr('xlink:href', '#play');
                isPlaying = false;
            }
        }

        function updateProgress(e) {
            const { currentTime, duration } = e.target;
            const percent = (currentTime / duration) * 100;
            player.find('.progress-bar span').css('width', `${percent}%`);
            progressCurr.text(formatTime(currentTime));
            progressTot.text(formatTime(duration));
        }

        function setProgress(e) {
            const progressWidth = $(this).width();
            const offsetX = e.offsetX;
            const duration = audio.duration;
            audio.currentTime = (offsetX / progressWidth) * duration;
        }

        // Загрузка первого трека
        loadTrack(currentTrack);

        // Обработчики событий для каждого плеера
        player.find('.player-pause').click(togglePlay);

        player.find('.player-prev').click(function () {
            currentTrack = (currentTrack > 0) ? currentTrack - 1 : playlist.length - 1;
            loadTrack(currentTrack);
        });

        player.find('.player-next').click(function () {
            currentTrack = (currentTrack < playlist.length - 1) ? currentTrack + 1 : 0;
            loadTrack(currentTrack);
        });

        player.find('.playlist li').click(function () {
            currentTrack = $(this).index();
            loadTrack(currentTrack);
        });

        audio.addEventListener('timeupdate', updateProgress);

        player.find('.progress-bar').click(setProgress);

        audio.addEventListener('ended', function () {
            player.find('.player-next').click();
        });
    });
});
