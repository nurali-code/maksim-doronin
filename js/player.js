pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

$(document).ready(function () {
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
                console.error('...', error);
                return '...';
            }
        }

        function loadTrack(index) {
            const track = playlist.eq(index);
            playlist.removeClass('is_active');
            track.addClass('is_active');
            const audioSrc = "songs/" + track.data('src');
            audio.src = audioSrc;
            const pdfSrc = "songs/" + track.data('src').replace(/\.mp3$/, '.pdf');
            loadLyricsFromPDF(pdfSrc);

            player.find('.current-name').text(track.find('.s-name').text());
            player.find('.current-author').text(track.find('.s-author').text());
            if ($(player).hasClass('--third')) {
                $(player).parents('.modal').find('.music-author').text(track.find('.s-author').text());
                $(player).parents('.modal').find('.music-name').text(track.find('.s-name').text());
            }

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
                audisPause()
                audio.play();
                isPlaying = true;
                player.find('.playlist li use').attr('xlink:href', '#play');
                player.find('.player-pause use, .playlist li.is_active use').attr('xlink:href', '#pause');
            } else {
                audisPause()
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

        const playerLyrics = player.find('.player-lyrics')

        async function fileExists(url) {
            try {
                const response = await fetch(url, { method: 'HEAD' });
                return response.ok;
            } catch (error) {
                console.error("Ошибка при проверке файла:", error);
                return false;
            }
        }

        async function loadLyricsFromPDF(pdfUrl) {
            const exists = await fileExists(pdfUrl);
            if (!exists) {
                playerLyrics.html("Текст отсутствует.");
                return;
            }

            fetch(pdfUrl)
                .then(response => response.arrayBuffer())
                .then(data => {
                    pdfjsLib.getDocument(new Uint8Array(data)).promise.then(pdf => {
                        let promises = [];

                        for (let i = 1; i <= pdf.numPages; i++) {
                            promises.push(
                                pdf.getPage(i).then(page =>
                                    page.getTextContent().then(content => {
                                        let textLines = [];
                                        let lastY = -1;

                                        content.items.forEach(item => {
                                            let text = item.str.trim();
                                            if (text === "") return;

                                            // Проверка на разрыв строки по координате Y
                                            if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 10) {
                                                textLines.push("<br>"); // Один перенос строки
                                            }

                                            // Добавляем текст строки
                                            textLines.push(text);
                                            lastY = item.transform[5]; // Обновляем Y
                                        });

                                        // Собираем текст из всех строк
                                        let fullText = textLines.join(" ");

                                        // Убираем пробелы перед знаками препинания
                                        fullText = fullText.replace(/\s([.,!?;:])/g, "$1");

                                        // Заменяем одинарные переносы на один <br>, а двойные на <br><br>
                                        fullText = fullText.replace(/<br>\s*<br>/g, "<br><br>");

                                        // Добавляем <br><br> перед словами "Куплет", "Припев", "Бридж" и оборачиваем в <b>
                                        fullText = fullText.replace(/(Куплет|Припев|Intro|Введение|Versus|Bridge|Written|Verse|Автор|Вступление|Бридж)/g, "<br><b>$1</b>");

                                        return fullText;
                                    })
                                )
                            );
                        }

                        Promise.all(promises).then(pagesText => {
                            playerLyrics.html(pagesText.join("<br><br>")); // Разделяем страницы двойным <br>
                        });
                    });
                })
                .catch(error => {
                    console.error("Ошибка загрузки PDF:", error);
                    playerLyrics.html("Ошибка загрузки текста.");
                });
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

function audisPause() { $('audio').each(function () { this.pause() }) }

$('.player-show').on('click', function () {
    $(this).toggleClass('is_active');
    $(this).parents('.modal').find('.playlist-wrap').fadeToggle();

})

$('[data-nav]').on('click', function () {
    let nav = $(this).data('nav');
    const parent = $(this).parents('section');
    $(this).addClass('is_active').siblings().removeClass('is_active');
    $(parent).find('[data-id]').removeClass('is_active');
    $(parent).find('[data-id="' + nav + '"]').addClass('is_active');
    if (nav === 'all') {
        $(parent).find('li[data-src]').fadeIn();
        $(parent).find('li[data-src]').first().click();
    } else {
        $(parent).find('li[data-src]').hide().filter(function () {
            return $(this).data('src').startsWith(nav + '/');
        }).fadeIn().first().click();
    }
});

function forBq(el) {
    audisPause();
    const trIt = $('#music').find(`[data-src="${el.data('play')}"]`);
    console.log($(trIt));
    trIt.click();
    const aud = $('#music audio')[0];
    aud.load()
    $('#music').find('.player-pause').click();
}

$('[data-play]').on('mouseenter', function () { forBq($(this)) });

if (window.innerWidth <= 992) {
    $('[data-play]').on('click', function () { forBq($(this)) });
}



