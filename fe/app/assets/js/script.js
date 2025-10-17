(function ($) {
    "use strict";

    AOS.init({
        disable: false,
        easing: 'ease',
        once: false,
        mirror: true,
        duration: 900
    });

    // Hero slider
    $('.js-hero-slider').slick({
        autoplay: false,
        autoplaySpeed: 2000,
        infinite: true,
        arrows: false,
        fade: true,
        speed: 800
    });

    /* SLIDE MEMPELAI */
    $('.pria-slider').slick({
        autoplay: true,
        autoplaySpeed: 2000,
        infinite: true,
        arrows: false,
        fade: true,
        speed: 800
    });

    $('.wanita-slider').slick({
        autoplay: true,
        autoplaySpeed: 2000,
        infinite: true,
        arrows: false,
        fade: true,
        speed: 800
    });

    /* COUNTDOWN*/
    var $countdown = $('.js-counter');
    var $date = $countdown.attr('data-date');

    $countdown.countdown($date, function (event) {
        $('.js-counter-days').html(event.strftime('%D'));
        $('.js-counter-hours').html(event.strftime('%H'));
        $('.js-counter-minutes').html(event.strftime('%M'));
        $('.js-counter-seconds').html(event.strftime('%S'));
    });

    /* SLIDE GALERY */
    var $slider = $('.js-slider').slick({
        centerMode: true,
        centerPadding: '12%',
        slidesToShow: 1,
        autoplay: true,
        autoplaySpeed: 1800,
        arrows: false,
        focusOnSelect: true,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    arrows: false,
                    slidesToShow: 1
                }
            },
            {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    slidesToShow: 1
                }
            }
        ]
    });

    /* MASONRY GRID */
    var $grid = $('.grid').masonry({
        itemSelector: '.grid-item',
        percentPosition: true,
        columnWidth: '.grid-sizer',
        gutter: '.gutter-sizer',
    });

    $grid.imagesLoaded().progress(function () {
        $grid.masonry('layout');
    });

    jQuery('.story-popup').magnificPopup({
        type: 'image',
        gallery: {
            enabled: true
        }
    });

    $(document).ready(function () {
        $('#modal_undangan').modal('show');
    });

    /* ACTIVE LINK */
    function getSectionsOffset() {
        var sections = $('.js-section');
        var sectionsInfo = [];

        sections.each(function () {
            var $self = $(this);
            sectionsInfo.push({
                id: $self.attr('id'),
                offset: $self.offset().top - 100,
            });
        });

        return sectionsInfo;
    }

    function setActiveNavLink() {
        var scrollPosition = $(window).scrollTop() + 53;
        for (var i = 0; i < sectionsInfo.length; i++) {
            if (scrollPosition >= sectionsInfo[i].offset) {
                $('.js-nav-link').removeClass('active');
                $('.js-nav-link[href="#' + sectionsInfo[i].id + '"]').addClass('active');
            }
        }
    }

    function debounce(func, wait) {
        var timeout;
        var later = function () {
            timeout = undefined;
            func.call();
        };

        return function () {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(later, wait);
        };
    };

    $(document).ready(function () {
        $(document).bind("contextmenu", function (e) {
            return false;
        });
    });

    var btnmodal = document.getElementById("btn-open");
    var btnmusic = document.getElementById("buttonmusic");
    var audio = document.getElementById("player");

    audio.loop = true;

    btnmodal.addEventListener("click", function () {
        $('.js-hero-slider').slick('slickPlay');
        $('#buttonmusic').fadeIn('fast');

        if (audio.paused) {
            audio.play();
            btnmusic.innerHTML = "<ion-icon name='volume-high-outline'></ion-icon>";
        }

        return false;
    });

    btnmusic.addEventListener("click", function () {
        if (audio.paused) {
            audio.play();
            btnmusic.innerHTML = "<ion-icon name='volume-high-outline'></ion-icon>";
        } else {
            audio.pause();
            btnmusic.innerHTML = "<ion-icon name='volume-mute-outline'></ion-icon>";
        }
    });

    /* Ucapan */
    function loadUcapan() {
        $.ajax({
            url: "http://gelarpawiwahan.site:8081/ucapan",
            type: "GET",
            success: function (data) {
                var container = $('.box_ucapan');
                container.empty(); // Kosongkan container sebelum mengisi

                if (data && data.length > 0) {
                    $.each(data, function (index, item) {
                        var ucapanHtml = `
                                <div class='row_ucapan'>
                                    <div class='card'>
                                        <div class='card-body'>
                                            <blockquote class=''>
                                                <p>${item.ucapan || ''}</p>
                                                <footer class='blockquote-footer small p-1'>
                                                    <span class='ucapan_nama'>
                                                        ${item.nama},
                                                        <span class='ucapan-hadir'>Saya akan ${item.kehadiran.toLowerCase()}</span>
                                                    </span>
                                                </footer>
                                            </blockquote>
                                        </div>
                                    </div>
                                </div>`;
                        container.append(ucapanHtml);
                    });
                } else {
                    container.html("<p class='text-center'>Jadilah yang pertama memberikan ucapan!</p>");
                }
            },
            error: function () {
                $('.box_ucapan').html("<p class='text-center text-danger'>Gagal memuat ucapan.</p>");
            }
        });
    }

    function SubForm() {
        var nama = $('#nama').val();
        var hadir = $("input[type='radio'][name='kehadiran']:checked").val();
        var ucapan = $("#ucapan").val();

        // (BARU) Buat objek data untuk dikirim sebagai JSON
        var dataToSend = {
            nama: nama,
            hadir: hadir,
            ucapan: ucapan
        };

        if (nama && hadir && ucapan) {
            $.ajax({
                url: "http://gelarpawiwahan.site:8081/save",
                type: "POST",
                contentType: "application/json", // (BARU) Set content type ke JSON
                data: JSON.stringify(dataToSend), // (BARU) Ubah objek ke string JSON
                cache: false,
                beforeSend: function () {
                    $("#showLoading").show();
                    $(".rsvp-form-submit").attr("disabled", "disabled");
                },
                success: function (dataResult) {
                    $('#showNotif').html('Ucapan sudah tersampaikan');
                    $('#rsvp-form')[0].reset();
                    $('#showNotif').fadeIn('slow');
                    setTimeout(function () {
                        $('#showNotif').fadeOut('slow');
                    }, 3000);

                    loadUcapan(); // (BARU) Muat ulang daftar ucapan setelah berhasil
                },
                error: function () {
                    alert("Terjadi kesalahan saat mengirim ucapan :(")
                },
                complete: function () {
                    $("#showLoading").hide();
                    $(".rsvp-form-submit").removeAttr("disabled");
                }
            });
        } else {
            $('#showError').html('Harap lengkapi semua isian');
            $('#showError').fadeIn('slow');
            setTimeout(function () {
                $('#showError').fadeOut('slow');
            }, 2000);
        }
    }

    $(document).ready(function () {
        loadUcapan();
    });
}(jQuery));
