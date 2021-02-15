// ==UserScript==
// @name         Weasyl Crossposter
// @namespace    https://mileshouse.neocities.org/
// @version      1.3
// @description  waxpost but it works
// @author       warpKaiba
// @match        https://www.furaffinity.net/view/*
// @match        https://inkbunny.net/s*
// @match        https://www.weasyl.com/submit/visual*
// @match        https://www.sofurry.com/view*
// @match        https://www.deviantart.com/*/art*
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// @icon         https://www.weasyl.com/img/favicon-YIHdjAYHmG.png
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @downloadURL  https://github.com/warpKaiba/waxpost-userscript/raw/main/weasyl-crossposter.user.js
// ==/UserScript==


// TODO:
// Handle links in descriptions
// old sites: imgur, deviantart
// new sites: pillowfort, e621 and...? what do people even use now other than twitter :[
// i guess crosspost from twitter support, you can open multiple tabs at once
// in the future maybe expand and allow crossposting between all these sites
// *_*_*_*_*_*_*


if (window.location.href.includes("weasyl.com/submit/visual")) {
    // this part runs on the weasyl submission page to handle setting the rating and subcategory because
    // those values are not handled by the website unlike the description, title etc
    let rating = new URLSearchParams(window.location.search).get("rating");
    if (rating) {
        rating = rating.toLowerCase();
        let subrateElem = document.querySelector('#submissionrating')
        switch(true) {
            case (rating.includes("general")):
                subrateElem.value = 10;
                break;
            case (rating.includes("mature")):
                subrateElem.value = 30;
                break;
            case (rating.includes("adult")):
                subrateElem.value = 40;
        } // do not default to anything
    }
    let category = new URLSearchParams(window.location.search).get("category");
    if (category) {
        category = category.toLowerCase();
        let categoryElem = document.querySelector('#submissioncat')
        switch(true) {
            case (category.includes("sketch")):
                categoryElem.value = 1010;
                break;
            case (category.includes("traditional")):
                categoryElem.value = 1020;
                break;
            case (category.includes("digital")):
                categoryElem.value = 1030;
                break;
            case (category.includes("crafts")):
                categoryElem.value = 1075;
                break;
            default:
                categoryElem.value = 1030; //defaults to digital

        }
    }
}

GM_registerMenuCommand("Post to Weasyl", function() {

    var tabScripts = {};
    var tabScriptRegexps = [
        [/^https?:\/\/(?:[^.]+\.)?deviantart\.com\/.*\/art\//, deviantart],
        [/^https?:\/\/www\.sofurry\.com\/view\//, sofurry],
        [/^https?:\/\/(?:[^.]+\.)?furaffinity\.net\/view\//, furaffinity],
        [/^https?:\/\/inkbunny\.net\/s/, inkbunny],
        [/^https?:\/\/i\.imgur\.com\//, imgur],
    ];

    var foundNoMatch = tabScriptRegexps.every(function (entry) {
        if (entry[0].test(window.location)) {
            tabScripts = entry[1];
            return false;
        }
        return true;
    });

    if (!foundNoMatch) {
        tabScripts();
    }

    function deviantart() {
        var title, tags, description, imageURL, rating, category;
        title = $('[data-hook="deviation_title"]').get(0).innerText;
        tags = $.map($('[href*="https://www.deviantart.com/tag/"]').get(),
                         function (x) { return x.textContent; });
        description = $('.legacy-journal').get(0).innerText;
        imageURL = $('img[alt='+title+']').get(0).src;
        rating = "null";
        category = "null"; //not sure what to do here it looks like theres no categorization on here ..
        newTab(title, tags, description, imageURL, rating, category);
    }

    function sofurry() {
        var title, tags, description, imageURL, rating, category;

        title = $('#sfContentTitle').get(0).innerText;
        var tagContainers = $('#submission_tags div.section-content');
        tags = $.map($('a', tagContainers.get(0)).get(),
                     function (x) { return x.innerText.replace(/ /g, '_'); });
        description = $('#sfContentDescription').get(0).innerText;
        imageURL = $('#sfContentImage a').attr('href');
        rating = "null";
        category = "null"; // ? sofurry only has this info in tagging system, but its not strict like e621 so ...

        newTab(title, tags, description, imageURL, rating, category);
    }

    function imgur() {window.alert("not implemented yet, sorry!")}

    function inkbunny() {
        var title, tags, description, imageURL, rating, category;
        title = document.querySelector("table.pooltable h1").innerText;
        tags = $('div div:nth-child(1) a span', $('#kw_scroll').next());
        tags = $.map(tags.get(),
                     function (x) { return x.innerText.replace(/ /g, '_'); });
        description = $('div.elephant_bottom.elephant_white div.content div span').get(0).innerText;
        var image = $('img#magicbox').eq(0);
        var imageLink = image.parent('a');
        imageURL = imageLink.length ? imageLink.attr('href') : image.attr('src');
        rating = document.querySelector('[style="width: 120px; color: #333333; font-size: 10pt;"]').textContent; //absolutely dont want to do it like this but they use about 1 class in their whole site
        if (rating.toLowerCase().includes("general")) {
            rating = "general";
        } else if (rating.toLowerCase().includes("mature")) {
            rating = "mature";
        } else if (rating.toLowerCase().includes("adult")) {
            rating = "adult";
        }
        category = "digital"; // most ib categories would only fit under digital anyway

        newTab(title, tags, description, imageURL, rating, category);
    }

    function furaffinity() {
        var title, tags, description, imageURL, rating, category;

        if (document.getElementById('submission_page') == null) {
            //using classic theme; leftover from waxpost i think its not possible to use classic theme anymore tho
            title = $('table.maintable table.maintable td.cat b');
            title = title.get(title.length-1).innerText;
            tags = $.map($('#keywords a').get(),
                         function (x) { return x.innerText.replace(/ /g, '_'); });
            description = $('table.maintable td.alt1[width="70%"]').text();

        } else {
            //using beta theme
            title = document.querySelector('div.submission-title p').textContent;
            //description = document.querySelector('#submission_page div.bg1 div.bg3 div.p20').innerText;
            description = document.querySelector('.submission-description').innerText;
            rating = document.querySelector('.rating-box').textContent.replace(/ /g, '');
            category = document.querySelector('.category-name').textContent
            if (category.toLowerCase().includes("traditional")) {
                category = "traditional";
            } else if (category.toLowerCase().includes("crafting")) {
                category = "crafts";
            } else {
                category = "digital";
            }


            tags = Array.prototype.map.call(document.querySelectorAll('.tags-row .tags'),
                                            function(tag) {
                return tag.getElementsByTagName('a')[0].innerText;
            });
        }
        imageURL = document.querySelector('.download a').href;

        newTab(title, tags, description, imageURL, rating, category);
    }


    function newTab(title, tags, description, imageURL, rating, category) {
        var url = 'https://www.weasyl.com/submit/visual?' + $.param({
            title: title,
            tags: tags,
            description: description,
            baseURL: document.location,
            imageURL: imageURL,
            rating: rating,
            category: category
        }, true);
        GM_openInTab(url);
    }



}, "w");
