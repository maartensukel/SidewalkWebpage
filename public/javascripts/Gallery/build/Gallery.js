/**
 * A Card module.
 * @param params properties of the associated label.
 * @param imageUrl google maps static image url for label.
 * @returns {Card}
 * @constructor
 */
function Card (params, imageUrl) {
    let self = this;

    // UI card element.
    let card = null;

    // Validation menu tied to label.
    let validationMenu = null;

    // The width-height ratio for the card

    let widthHeightRatio = (4/3);

    // Properties of the label in the card.
    let properties = {
        label_id: undefined,
        label_type: undefined,
        gsv_panorama_id: undefined,
        heading: undefined,
        pitch: undefined,
        zoom: undefined,
        canvas_x: undefined,
        canvas_y: undefined,
        canvas_width: undefined,
        canvas_height: undefined,
        severity: undefined,
        temporary: undefined,
        description: undefined,
        tags: []
    };

    // Paths to label icon images.
    // TODO: This object should be moved to a util file since it is shared in validation and admin tools as well.
    let iconImagePaths = {
        CurbRamp : '/assets/images/icons/AdminTool_CurbRamp.png',
        NoCurbRamp : '/assets/images/icons/AdminTool_NoCurbRamp.png',
        Obstacle : '/assets/images/icons/AdminTool_Obstacle.png',
        SurfaceProblem : '/assets/images/icons/AdminTool_SurfaceProblem.png',
        Other : '/assets/images/icons/AdminTool_Other.png',
        Occlusion : '/assets/images/icons/AdminTool_Other.png',
        NoSidewalk : '/assets/images/icons/AdminTool_NoSidewalk.png'
    };

    // Status to determine if static imagery has been loaded.
    let status = {
        imageFetched: false
    };

    // Default image width.
    let width = 360;

    let imageDim = {
        w:0,
        h:0
    }

    // Icon for label.
    const labelIcon = new Image();

    // The static pano image.
    const panoImage = new Image();

    /**
     * Initialize Card.
     * 
     * @param {*} param Label properties.
     */
    function _init (param) {
        for (let attrName in param) {
            properties[attrName] = param[attrName];
        }

        // Place label icon.
        labelIcon.src = iconImagePaths[getLabelType()];
        labelIcon.className = "label-icon";
        let iconCoords = getIconCoords();
        labelIcon.style.left = iconCoords.x + "px";
        labelIcon.style.top = iconCoords.y + "px";

        let imageId = "label_id_" + properties.label_id;
        panoImage.id = imageId;
        panoImage.className = "static-gallery-image";

        // Clean up ternary operators with constants?
        let severityHeader = properties.severity ? properties.severity : getLabelType() === "Occlusion" ? "not applicable" : "none";
        let tagHeader = properties.tags.length > 0 ? properties.tags.join(", ") : getLabelType() === "Occlusion" ? "not applicable" : "none";

        const cardHtml = `
            <p class="label-severity"><b>Severity:</b> ${severityHeader}</p>
            <p class="label-tags"><b>Tags:</b> ${tagHeader}</p>
        `;

        card = document.createElement('div');
        card.className = "gallery-card";
        card.innerHTML = cardHtml;

        card.prepend(panoImage);
        card.appendChild(labelIcon);

        validationMenu = new ValidationMenu(card, properties);
    }

    /**
     * Return object with label coords on static image.
     */
    function getIconCoords () {
        return {
            x: imageDim.w * properties.canvas_x / properties.canvas_width,
            y: imageDim.h * properties.canvas_y / properties.canvas_height
        };
    }

    /**
     * Update image width.
     * 
     * @param {*} w New width.
     */
    function updateWidth(w) {
        width = w;
        card.style.width = w + "px";

        imageDim.w = w - 10;
        imageDim.h = imageDim.w / widthHeightRatio;       

        let iconCoords = getIconCoords();
        labelIcon.style.left = iconCoords.x + "px";
        labelIcon.style.top = iconCoords.y + "px";
    }

    /**
     * This function returns labelId property.
     * 
     * @returns {string}
     */
    function getLabelId () {
        return properties.label_id;
    }

    /**
     * This function returns labelType property.
     * 
     * @returns {string}
     */
    function getLabelType () {
        return properties.label_type;
    }

    /**
     * Return the deep copy of the properties object,
     * so the caller can only modify properties from
     * setProperty().
     * JavaScript Deepcopy:
     * http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-a-javascript-object
     */
    function getProperties () { return $.extend(true, {}, properties); }

    /**
     * Get a property.
     * 
     * @param propName Property name.
     * @returns {*} Property value if property name is valid. Otherwise false.
     */
    function getProperty (propName) { return (propName in properties) ? properties[propName] : false; }

    /**
     * Get status of card.
     */
    function getStatus() {
        return status;
    }

    /**
     * Loads the pano image from url.
     */
    function loadImage() {
        return new Promise(resolve => {
            if (!status.imageFetched) {
                let img = panoImage;
                img.onload = () => {
                    status.imageFetched = true;
                    resolve(true);
                    //cardContainer.append(card);
                };
    
                img.src = imageUrl;
            } else {
                resolve(true);
            }
        });
    }

    /**
     * Renders the card. 
     * 
     * @param cardContainer UI element to render card in.
     * @returns {self}
     */
    function render (cardContainer) {
        // TODO: should there be a safety check here to make sure pano is loaded?
        panoImage.width = imageDim.w;
        panoImage.height = imageDim.h;
        cardContainer.append(card);
    }

    /**
     * Render with an overload that allows you to set the width and height of the card.
     */
    function renderSize(cardContainer, width) {
        updateWidth(width);
        render(cardContainer);
    }

    /**
     * Sets a property. 
     * 
     * @param key Property name.
     * @param value Property value.
     * @returns {setProperty}
     */
    function setProperty (key, value) {
        properties[key] = value;
        return this;
    }

    /**
     * Set aspect of status.
     * 
     * @param {*} key Status name.
     * @param {*} value Status value.
     */
    function setStatus(key, value) {
        if (key in status) {
            status[key] = value;
        } else {
            throw self.className + ": Illegal status name.";
        }
    }

    self.getLabelId = getLabelId;
    self.getLabelType = getLabelType;
    self.getProperties = getProperties;
    self.getProperty = getProperty;
    self.getStatus = getStatus;
    self.loadImage = loadImage;
    self.render = render;
    self.renderSize = renderSize;
    self.setProperty = setProperty;
    self.setStatus = setStatus;

    _init(params);
    return this;
}

/**
 * A Card Bucket to store Cards of a certain label type.
 * 
 * @param bucket List of Cards in order received from database.
 * @returns {CardBucket}
 * @constructor
 */
function CardBucket(inputCards) {
    let self = this;
    let bucket = inputCards || [];
    /**
     * Add a Card to bucket.
     * 
     * @param {*} card Card to add.
     */
    function push(card) {
        bucket.push(card);
    }

    /**
     * Filters cards upon a non-empty array of tags.
     * 
     * @param {*} tags Tags to filter upon.
     */
    function filterOnTags(tags) {
        if (tags.length > 0) {
            let tagSet = new Set(tags);
            bucket = bucket.filter(card => card.getProperty("tags").some(tag => tagSet.has(tag)));
        }
    }

    /**
     * Filters cards upon a non-empty array of severities.
     * 
     * @param {*} severities Severities to filter upon.
     */
    function filterOnSeverities(severities) {
        if (severities.length > 0) {
            let severitySet = new Set(severities);
            bucket = bucket.filter(card => severitySet.has(card.getProperty("severity")));
        }
    }

    /**
     * Return all Cards in bucket.
     */
    function getCards() {
        return bucket;
    }

    /**
     * Return how many Cards are in bucket.
     */
    function getSize() {
        return bucket.length;
    }

    /**
     * Return a copy of this CardBucket. 
     * This is not a deepcopy (the cards themselves are not copied).
     */
    function copy() {
        return new CardBucket([...bucket]);
    }

    self.push = push;
    self.filterOnTags = filterOnTags;
    self.filterOnSeverities = filterOnSeverities;
    self.getCards = getCards;
    self.getSize = getSize;
    self.copy = copy;

    return this;
}

/**
 * Card Container module. 
 * This is responsible for managing the Card objects that are to be rendered.
 * 
 * @param {*} uiCardContainer UI element tied with this CardContainer.
 * @returns {CardContainer}
 * @constructor
 */
function CardContainer(uiCardContainer) {
    let self = this;

    // The number of labels to grab from database on initial page load.
    const initialLoad = 30;

    // The number of cards to be shown on a page.
    const cardsPerPage = 9;

    // The number of cards per line.
    const cardsPerLine = 3;

    // Pading between cards.
    const cardPadding = 25;

    // TODO: Possibly remove if any type of sorting is no longer wanted.
    let status = {
        order: 0
    };

    // Map label type to id.
    let labelTypeIds = {
        CurbRamp: 1,
        NoCurbRamp: 2,
        Obstacle: 3,
        SurfaceProblem: 4,
        Other: 5,
        Occlusion: 6,
        NoSidewalk: 7,
        Assorted: 9
    };

    // Current label type of cards being shown.
    let currentLabelType = 'Assorted';

    let currentPage = 1;

    let pageNumberDisplay = null;

    let pagewidth;

    // Map Cards to a CardBucket containing Cards of their label type.
    let cardsByType = {
        Assorted: new CardBucket(),
        CurbRamp: new CardBucket(),
        NoCurbRamp: new CardBucket(),
        Obstacle: new CardBucket(),
        SurfaceProblem: new CardBucket(),
        Other: new CardBucket(),
        Occlusion: new CardBucket(),
        NoSidewalk: new CardBucket()
    };

    // Keep track of labels we have loaded already as to not grab the same label from the backend.
    let loadedLabelIds = new Set();

    // Current labels being displayed of current type based off filters.
    let currentCards = new CardBucket();

    function _init() {
        pagewidth = uiCardContainer.holder.width();

        // Bind click actions to the forward/backward paging buttons.
        if (uiCardContainer) {
            uiCardContainer.nextPage.bind({
                click: handleNextPageClick
            })
            uiCardContainer.prevPage.bind({
                click: handlePrevPageClick
            })
        }

        pageNumberDisplay = document.createElement('h2');
        pageNumberDisplay.innerText = "1";
        uiCardContainer.pageNumber.append(pageNumberDisplay);
        $("#page-control").hide();
        sg.tagContainer.disable();
        $("#prev-page").prop("disabled", true);
        cardsByType[currentLabelType] = new CardBucket();

        // Grab first batch of labels to show.
        fetchLabelsByType(labelTypeIds.Assorted, initialLoad, Array.from(loadedLabelIds), function() {
            currentCards = cardsByType[currentLabelType].copy();
            render();
        });
    }

    function handleNextPageClick() {
        sg.tracker.push("NextPageClick", null, {
            from: currentPage,
            to: currentPage + 1
        });
        setPage(currentPage + 1);
        $("#prev-page").prop("disabled", false);
        updateCardsNewPage();
    }

    function handlePrevPageClick() {
        if (currentPage > 1) {
            sg.tracker.push("PrevPageClick", null, {
                from: currentPage,
                to: currentPage - 1
            });
            $("#next-page").prop("disabled", false);
            setPage(currentPage - 1);
            updateCardsNewPage();
        }
    }

    function setPage(pageNumber) {
        if (pageNumber <= 1) {
            $("#prev-page").prop("disabled", true);
        } 
        currentPage = pageNumber;
        pageNumberDisplay.innerText = pageNumber;
    }

    /**
     * Grab n assorted labels of specified type.
     * 
     * @param {*} labelTypeId Label type id specifying labels of what label type to grab.
     * @param {*} n Number of labels to grab.
     * @param {*} loadedLabels Label Ids of labels already grabbed.
     * @param {*} callback Function to be called when labels arrive.
     */
    function fetchLabelsByType(labelTypeId, n, loadedLabels, callback) {
        $.getJSON("/label/labelsByType", { labelTypeId: labelTypeId, n: n, loadedLabels: JSON.stringify(loadedLabels)}, function (data) {
            if ("labelsOfType" in data) {
                let labels = data.labelsOfType,
                    card,
                    i = 0,
                    len = labels.length;
                for (; i < len; i++) {
                    let labelProp = labels[i];
                    if ("label" in labelProp && "imageUrl" in labelProp) {
                        card = new Card(labelProp.label, labelProp.imageUrl);
                        self.push(card);
                        loadedLabelIds.add(card.getLabelId());
                    }
                }

                if (callback) callback();
            }
        });
        
    }

    /**
     * Grab n assorted labels of specified label type, severities, and tags.
     * 
     * @param {*} labelTypeId Label type id specifying labels of what label type to grab.
     * @param {*} n Number of labels to grab.
     * @param {*} loadedLabels Label Ids of labels already grabbed.
     * @param {*} severities Severities the labels to be grabbed can have.
     * @param {*} tags Tags the labels to be grabbed can have.
     * @param {*} callback Function to be called when labels arrive.
     */
    function fetchLabelsBySeverityAndTags(labelTypeId, n, loadedLabels, severities, tags, callback) {
        $.getJSON("/label/labelsBySeveritiesAndTags", { labelTypeId: labelTypeId, n: n, loadedLabels: JSON.stringify(loadedLabels), severities: JSON.stringify(severities), tags: JSON.stringify(tags) }, function (data) {
            if ("labelsOfType" in data) {
                let labels = data.labelsOfType,
                    card,
                    i = 0,
                    len = labels.length;
                for (; i < len; i++) {
                    let labelProp = labels[i];
                    if ("label" in labelProp && "imageUrl" in labelProp) {
                        card = new Card(labelProp.label, labelProp.imageUrl);
                        self.push(card)
                        loadedLabelIds.add(card.getLabelId());
                    }
                }

                if (callback) callback();
            }
        });

    }

    /**
     * Returns cards of current type.
     */
    function getCards() {
        return cardsByType;
    }

    /**
     * Returns cards of current type that are being rendered.
     */
    function getCurrentCards() {
        return currentCards;
    }

    /**
     * Push a card into corresponding CardBucket in cardsOfType as well as the "Assorted" bucket.
     * @param card Card to add.
     */
    function push(card) {
        cardsByType.Assorted.push(card);
        cardsByType[card.getLabelType()].push(card);
    }

    /**
     * Updates cardsOfType when new label type selected.
     */
    function updateCardsByType() {
        refreshUI();

        let filterLabelType = sg.tagContainer.getStatus().currentLabelType;
        if (currentLabelType !== filterLabelType) {
            // Reset back to the first page.
            setPage(1);
            sg.tagContainer.unapplyTags(currentLabelType)
            currentLabelType = filterLabelType;

            fetchLabelsByType(labelTypeIds[filterLabelType], cardsPerPage, Array.from(loadedLabelIds), function () {
                currentCards = cardsByType[currentLabelType].copy();
                render();
            });
        }
    }

    /**
     * Updates Cards being shown when user moves to next/previous page.
     */
    function updateCardsNewPage() {
        // TODO: lots of repeated code among this method and updateCardsByTag and updateCardsBySeverity.
        // Think about improving code design.
        refreshUI();

        let appliedTags = sg.tagContainer.getAppliedTagNames();

        let appliedSeverities = sg.tagContainer.getAppliedSeverities();

        currentCards = cardsByType[currentLabelType].copy();
        currentCards.filterOnTags(appliedTags);
        currentCards.filterOnSeverities(appliedSeverities);

        if (currentCards.getSize() < cardsPerPage * currentPage) {
            // When we don't have enough cards of specific query to show on one page, see if more can be grabbed.
            if (currentLabelType === "Occlusion") {
                fetchLabelsByType(labelTypeIds[currentLabelType], cardsPerPage, Array.from(loadedLabelIds), function () {
                    currentCards = cardsByType[currentLabelType].copy();
                    render();
                });
            } else {
                fetchLabelsBySeverityAndTags(labelTypeIds[currentLabelType], cardsPerPage, Array.from(loadedLabelIds), appliedSeverities, appliedTags, function() {
                    currentCards = cardsByType[currentLabelType].copy();
                    currentCards.filterOnTags(appliedTags);
                    currentCards.filterOnSeverities(appliedSeverities);
        
                    render();
                });
            }
        } else {
            render();
        }
    }

    /**
     * When tag filter is updated, update Cards to be shown.
     */
    function updateCardsByTag() {
        setPage(1);
        refreshUI();

        let appliedTags = sg.tagContainer.getAppliedTagNames();
        let appliedSeverities = sg.tagContainer.getAppliedSeverities();

        fetchLabelsBySeverityAndTags(labelTypeIds[currentLabelType], cardsPerPage, Array.from(loadedLabelIds), appliedSeverities, appliedTags, function() {
            currentCards = cardsByType[currentLabelType].copy();
            currentCards.filterOnTags(appliedTags);
            currentCards.filterOnSeverities(appliedSeverities);

            render();
        });
    }

    /**
     * When severity filter is updated, update Cards to be shown.
     */
    function updateCardsBySeverity() {
        setPage(1);
        refreshUI();

        let appliedTags = sg.tagContainer.getAppliedTagNames();
        let appliedSeverities = sg.tagContainer.getAppliedSeverities();

        fetchLabelsBySeverityAndTags(labelTypeIds[currentLabelType], cardsPerPage, Array.from(loadedLabelIds), appliedSeverities, appliedTags, function() {
            currentCards = cardsByType[currentLabelType].copy();
            currentCards.filterOnTags(appliedTags);
            currentCards.filterOnSeverities(appliedSeverities);

            render();
        });
    }

    function sortCards(order) {
        // uiCardContainer.holder.empty();
        // currentCards.sort((card1, card2) => sg.cardSortMenu.getStatus().severity * card1.getProperty("severity") - card2.getProperty("severity"));
        //
        // render();
        // console.log("sort cards in card container called");
        // // Write a sorting query for backend
        // setStatus("order", order);
        // render();
    }

    /**
     * Renders current cards.
     */
    function render() {
        $("#page-loading").show();
        $("#page-control").hide();
         
        // TODO: should we try to just empty in the render method? Or assume it's 
        // already been emptied in a method utilizing render?
        clearCardContainer(uiCardContainer.holder);
        pagewidth = uiCardContainer.holder.width();
        const cardWidth = pagewidth/cardsPerLine - cardPadding;

        let idx = (currentPage - 1) * cardsPerPage;
        let cardBucket = currentCards.getCards();

        let imagesToLoad = [];
        let imagePromises = [];

        while (idx < currentPage * cardsPerPage && idx < cardBucket.length) {
            imagesToLoad.push(cardBucket[idx]);
            imagePromises.push(cardBucket[idx].loadImage());

            idx++;
        }

        if (imagesToLoad.length > 0) {
            if (imagesToLoad.length < cardsPerPage) {
                $("#next-page").prop("disabled", true);
            } else {
                $("#next-page").prop("disabled", false);
            }

            // We wait for all the promises from grabbing pano images to resolve before showing cards.
            Promise.all(imagePromises).then(() => {
                imagesToLoad.forEach(card => card.renderSize(uiCardContainer.holder, cardWidth));
                $("#page-loading").hide();
                $("#page-control").show();
                sg.tagContainer.enable();
                $("#label-select").prop("disabled", false);
            });
        } else {
            // TODO: figure out how to better do the toggling of this element.
            $("#labels-not-found").show();
            $("#page-loading").hide();
            sg.tagContainer.enable();
            $("#label-select").prop("disabled", false);
        }
    }

    /**
     * Refreshes the UI after each query made by user.
     */
    function refreshUI() {
        sg.tagContainer.disable();
        $("#label-select").prop("disabled", true);
        $("#labels-not-found").hide();
        $("#page-loading").show();
        $("#page-control").hide();
        clearCardContainer(uiCardContainer.holder);
    }

    /**
     * Set status attribute.
     * 
     * @param {*} key Status name.
     * @param {*} value Status value. 
     */
    function setStatus(key, value) {
        if (key in status) {
            status[key] = value;
        } else {
            throw self.className + ": Illegal status name.";
        }
    }

    /**
     * Flush all Cards currently being rendered.
     */
    function clearCurrentCards() {
        currentCards = new CardBucket();
    }

    /**
     * Flush all Cards from cardsOfType.
     */
    function clearCards() {
        for (let labelType in cardsByType) {
            cardsByType[labelType] = null;
        }
    }

    /**
     * Clear Cards from UI.
     * @param {*} cardContainer UI element to clear Cards from.
     */
    function clearCardContainer(cardContainer) {
        cardContainer.children().each(function() {
            $(this).detach();
        });
    }

    self.fetchLabelsByType = fetchLabelsByType;
    self.getCards = getCards;
    self.getCurrentCards = getCurrentCards;
    self.push = push;
    self.updateCardsByType = updateCardsByType;
    self.updateCardsByTag = updateCardsByTag;
    self.updateCardsBySeverity = updateCardsBySeverity;
    self.updateCardsNewPage = updateCardsNewPage;
    self.sortCards = sortCards;
    self.render = render;
    self.clearCurrentCards = clearCurrentCards;
    self.clearCards = clearCards;

    _init();
    return this;
}

/**
 * Compiles and submits log data from Gallery.
 * 
 * @param {*} url URL to send interaction data to.
 * @param {*} beaconUrl URL to send interaction data to on page unload.
 * @returns {Form}
 * @constructor
 */
function Form(url, beaconUrl) {
    let properties = {
        dataStoreUrl : url,
        beaconDataStoreUrl : beaconUrl
    };

    /**
     * Compiles data into a format that can be parsed by our backend.
     * @returns {{}}
     */
    function compileSubmissionData() {
        let data = {};

        data.environment = {
            browser: util.getBrowser(),
            browser_version: util.getBrowserVersion(),
            browser_width: $(window).width(),
            browser_height: $(window).height(),
            screen_width: screen.width,
            screen_height: screen.height,
            avail_width: screen.availWidth,
            avail_height: screen.availHeight, 
            operating_system: util.getOperatingSystem(),
            language: i18next.language
        };

        data.interactions = sg.tracker.getActions();
        sg.tracker.refresh();
        return data;
    }

    /**
     * Submits all front-end data to the backend.
     * 
     * @param data  Data object containing interactions.
     * @param async Whether to submit asynchronously or not.
     * @returns {*}
     */
    function submit(data, async) {
        if (typeof async === "undefined") {
            async = false;
        }

        if (data.constructor !== Array) {
            data = [data];
        }

        $.ajax({
            async: async,
            contentType: 'application/json; charset=utf-8',
            url: properties.dataStoreUrl,
            type: 'post',
            data: JSON.stringify(data),
            success: function () {
                console.log("Data logged successfully");
            },
            error: function (xhr, status, result) {
                console.error(xhr.responseText);
                console.error(result);
            }
        });
    }

    // On page unload, we compile stored interaction data and send it over.
    $(window).on('beforeunload', function () {
        sg.tracker.push("Unload");

        // April 17, 2019
        // What we want here is type: 'application/json'. Can't do that quite yet because the
        // feature has been disabled, but we should switch back when we can.
        //
        // // For now, we send plaintext and the server converts it to actual JSON
        //
        // Source for fix and ongoing discussion is here:
        // https://bugs.chromium.org/p/chromium/issues/detail?id=490015
        let data = [compileSubmissionData()];
        let jsonData = JSON.stringify(data);
        navigator.sendBeacon(properties.beaconDataStoreUrl, jsonData);
    });

    self.compileSubmissionData = compileSubmissionData;
    self.submit = submit;

    return self;
}

/**
 * Logs information from the Gallery.
 * 
 * @returns {Tracker}
 * @constructor
 */
function Tracker() {
    let self = this;
    let actions = [];

    function _init() {
        //_trackWindowEvents();
    }

    // TODO: update/include for v1.1
    function _trackWindowEvents() {
        let prefix = "LowLevelEvent_";

        // Track all mouse related events.
        $(document).on('mousedown mouseup mouseover mouseout mousemove click contextmenu dblclick', function(e) {
            self.push(prefix + e.type, {
                cursorX: 'pageX' in e ? e.pageX : null,
                cursorY: 'pageY' in e ? e.pageY : null
            });
        });

        // Keyboard related events.
        $(document).on('keydown keyup', function(e) {
            self.push(prefix + e.type, {
                keyCode: 'keyCode' in e ? e.keyCode : null
            });
        });
    }

    /**
     * Creates action to be added to action buffer.
     * 
     * @param action Action name.
     * @param suppData Optional supplementary data about action.
     * @param notes Optional notes about action.
     * @private
     */
    function _createAction(action, suppData, notes) {
        if (!notes) {
            notes = {};
        }

        let note = _notesToString(notes);
        let timestamp = new Date().getTime();

        let data = {
            action: action,
            pano_id: suppData && suppData.panoId ? suppData.panoId : null,
            note: note,
            timestamp: timestamp
        };

        return data;
    }

    /**
     * Return list of actions.
     */
    function getActions() {
        return actions;
    }

    /**
     * Convert notes object to string.
     * 
     * @param {*} notes Notes object.
     */
    function _notesToString(notes) {
        if (!notes)
            return "";

        let noteString = "";
        for (let key in notes) {
            if (noteString.length > 0)
                noteString += ",";
            noteString += key + ':' + notes[key];
        }

        return noteString;
    }

    /**
     * Pushes information to action list (to be submitted to the database).
     * 
     * @param action (required) Action name.
     * @param suppData (optional) Supplementary data to be logged about action.
     * @param notes (optional) Notes to be logged into the notes fieldin database.
     */
    function push(action, suppData, notes) {
        let item = _createAction(action, suppData, notes);
        actions.push(item);

        // TODO: change action buffer size limit
        if (actions.length > 10) {
            let data = sg.form.compileSubmissionData();
            sg.form.submit(data, true);
        }
        return this;
    }

    /**
     * Empties actions stored in the Tracker.
     */
    function refresh() {
        actions = [];
        self.push("RefreshTracker");
    }

    _init();

    self.getActions = getActions;
    self.push = push;
    self.refresh = refresh;

    return this;
}

/**
 * Card Filter module. 
 * This is responsible for allowing users to apply filters to specify what types of cards to render in the gallery.
 *
 * @param uiCardFilter UI element representing filter components of sidebar.
 * @param ribbonMenu UI element representing dropdown to select label type in sidebar.
 * @returns {CardFilter}
 * @constructor
 */
function CardFilter(uiCardFilter, ribbonMenu) {
    let self = this;

    let status = {
        currentLabelType: 'Assorted'
    };

    // Map label type to their collection of tags.
    let tagsByType = {
        Assorted: new TagBucket(),
        CurbRamp: new TagBucket(),
        NoCurbRamp: new TagBucket(),
        Obstacle: new TagBucket(),
        SurfaceProblem: new TagBucket(),
        Other: new TagBucket(),
        Occlusion: new TagBucket(),
        NoSidewalk: new TagBucket()
    };

    // Tags of the current label type.
    let currentTags = new TagBucket();

    // Collection of severities.
    let severities = new SeverityBucket();
   
    /**
     * Initialize CardFilter.
     */
    function _init() {
        getTags(function () {
            console.log("tags received");
            render();
        });
    }

    /**
     * Grab all tags from backend and sort them by label type into tagsByType.
     * 
     * @param {*} callback Function to be called when tags arrive.
     */
    function getTags(callback) {
        $.getJSON("/label/tags", function (data) {
            let tag,
                i = 0,
                len = data.length;
            for (; i < len; i++) {
                tag = new Tag(data[i]);
                tagsByType[tag.getLabelType()].push(tag);
            }

            if (callback) callback();
        });
    }

    /**
     * Update filter componenets when label type changes.
     */
    function update() {
        let currentLabelType = ribbonMenu.getCurrentLabelType();
        if (status.currentLabelType !== currentLabelType) {
            clearCurrentTags();
            severities.unapplySeverities();
            setStatus('currentLabelType', currentLabelType);
            currentTags = tagsByType[currentLabelType];
            sg.cardContainer.updateCardsByType();
        }

        render();
    }

    /**
     * Render tags and severities in sidebar.
     */
    function render() {
        if (currentTags.getTags().length > 0) {
            // TODO: think about to better show tags header in an organized manner.
            $("#tags-header").show();
            currentTags.render(uiCardFilter.tags);
        } else {
            $("#tags-header").hide();
        }
        if (status.currentLabelType == "Occlusion") {
            $("#filters").hide();
            $("#horizontal-line").hide();
        } else {
            $("#filters").show();
            $("#horizontal-line").show();
        }

        severities.render(uiCardFilter.severity);
    }

    /**
     * Return list of tags that have been selected by user.
     */
    function getAppliedTagNames() {
        return currentTags.getAppliedTags().map(tag => tag.getTag());
    }

    /**
     * Return list of all tags for current label type.
     */
    function getTagNames() {
        return currentTags.getTags().map(tag => tag.getTag());
    }

    /**
     * Return object containing all tags.
     */
    function getTagsByType() {
        return tagsByType;
    }

    /**
     * Return status of CardFilter.
     */
    function getStatus() {
        return status;
    }

    /**
     * Set attribute of status.
     * 
     * @param {*} key Status name.
     * @param {*} value Status value.
     */
    function setStatus(key, value) {
        if (key in status) {
            status[key] = value;
        } else {
            throw self.className + ": Illegal status name.";
        }
    }

    /**
     * Return list of severities.
     */
    function getSeverities() {
        return severities.getSeverities();
    }

    /**
     * Return list of selected severities by user.
     */
    function getAppliedSeverities() {
        return severities.getAppliedSeverities();
    }

    /**
     * Unapply all tags of specified label type.
     * 
     * @param {*} labelType Label type of tags to unapply.
     */
    function unapplyTags(labelType) {
        if (labelType != null) {
            console.log("tags unapplied");
            console.log(labelType);
            tagsByType[labelType].unapplyTags();
        }
    }

    /**
     * Clear tags currently being shown.
     */
    function clearCurrentTags() {
        uiCardFilter.tags.empty();
        unapplyTags(status.currentLabelType);
        currentTags = new TagBucket();
    }

    /**
     * Disable interaction with filters.
     */
    function disable() {
        severities.disable();
        $('.gallery-tag').prop("disabled", true);
    }

    /**
     * Enable interaction with filters.
     */
    function enable() {
        severities.enable();
        $('.gallery-tag').prop("disabled", false);
    }

    self.update = update;
    self.render = render;
    self.getAppliedTagNames = getAppliedTagNames;
    self.getTagNames = getTagNames;
    self.getTagsByType = getTagsByType;
    self.getStatus = getStatus;
    self.setStatus = setStatus;
    self.getSeverities = getSeverities;
    self.getAppliedSeverities = getAppliedSeverities;
    self.unapplyTags = unapplyTags;
    self.disable = disable;
    self.enable = enable;

    _init();
    return this;
}

/**
 * CardSort Menu module. Responsible for holding the switches allowing users to sort labels on various parameters.
 *
 * @returns {CardSortMenu}
 * @constructor
 */
function CardSortMenu(uiCardSortMenu) {
    let self = this;

    // The code values associated with each sort.
    let orderCodes = {
        sort_LeastSevere: 0,
        sort_MostSevere: 1 
    }

    // The status of the sorting at any point.
    let status = {
        severity: 1,
        sortType: "none"
    };

    function _init() {
        if (uiCardSortMenu) {
            uiCardSortMenu.sort.bind({
                change: handleSortSwitchClickCallback
            });
        }
    }
    
    /**
     * Callback function for when sorting order of cards is changed.
     */
    function handleSortSwitchClickCallback() {
        let sortType = $(this).val();
        setStatus("sortType", sortType);

        console.log("sort clicked");

        //TODO: Can we do this without referencing sg namespace?
        sg.cardContainer.sortCards(orderCodes[sortType]);
    }

    /**
     * Returns the status of the CardSortMenu
     */
    function getStatus() {
        // TODO: perhaps remove this if no other status added
        return status;
    }

    /**
     * Sets a specific key, value pair in the status
     * @param {*} key 
     * @param {*} value 
     */
    function setStatus(key, value) {
        if (key in status) {
            status[key] = value;
        } else {
            throw self.className + ": Illegal status name.";
        }
    }

    self.getStatus = getStatus;
    self.setStatus = setStatus;

    _init();
    return this;
}

/**
 * Ribbon Menu module.
 * This is responsible for holding the buttons allowing users to filter labels by label type.
 *
 * @param uiRibbonMenu UI element corresponding to RibbonMenu.
 * @returns {RibbonMenu}
 * @constructor
 */
function RibbonMenu(uiRibbonMenu) {
    let self = this;

    let status = {
        currentLabelType: null
    };

    /**
     * Initialize RibbonMenu.
     */
    function _init() {
        if (uiRibbonMenu) {
            uiRibbonMenu.select.bind({
                change: handleLabelSelectSwitchChangeCallback
            })
        }
    }

    /**
     * Handles what happens when a label type is selected.
     */
    function handleLabelSelectSwitchChangeCallback() {
        let labelType = $(this).val();
        setStatus("currentLabelType", labelType);
        sg.tracker.push("Filter_LabelType=" + labelType);
        sg.tagContainer.update();
    }

    /**
     * Returns current selected label type.
     */
    function getCurrentLabelType() {
        return status.currentLabelType;
    }

    /**
     * Return status of RibbonMenu.
     */
    function getStatus() {
        return status;
    }

    /**
     * Set status attribute.
     * 
     * @param {*} key Status name.
     * @param {*} value Status value.
     */
    function setStatus(key, value) {
        if (key in status) {
            status[key] = value;
        } else {
            throw self.className + ": Illegal status name.";
        }
    }

    self.getCurrentLabelType = getCurrentLabelType;
    self.getStatus = getStatus;
    self.setStatus = setStatus;

    _init();
    return this;
}

/**
 * A Severity module.
 * 
 * @param {*} params Properties of severity.
 * @returns {Severity}
 * @constructor
 */
function Severity (params){
    let self = this;

    // UI element of severity.
    let severityElement = null;

    let properties = {
        severity: undefined
    };

    // A boolean to see if the current severity filter is active.
    let active = false;

    /**
     * Initialize Severity.
     * 
     * @param {int} param Severity.
     */
    function _init(param) {
        properties.severity = param;
        severityElement = document.createElement('button');
        severityElement.className = 'gallery-severity';
        severityElement.id = properties.severity;
        severityElement.innerText = properties.severity;
        severityElement.disabled = true;
        severityElement.onclick = handleOnClickCallback;
    }

    /**
     * Handles when severity is selected/deselected.
     */
    function handleOnClickCallback(){
        if (active){
            sg.tracker.push("SeverityApply", null, {
                Severity: properties.severity
            });
            unapply();
        } else {
            sg.tracker.push("SeverityUnapply", null, {
                Severity: properties.severity
            });
            apply();
        }

        sg.cardContainer.updateCardsBySeverity();
    }

    /**
     * Applies a Severity.
     */
    function apply() {
        active = true;
        severityElement.setAttribute("style", "background-color: #78c8aa");
    }

    /**
     * Unapplies a Severity.
     */
    function unapply() {
        active = false;
        severityElement.setAttribute("style", "background-color: none");
    }

    /**
     * Renders Severity in sidebar.
     * 
     * @param {*} filterContainer UI element to render Severity in.
     */
    function render(filterContainer) {
        filterContainer.append(severityElement);
    }

    /**
     * Returns whether Severity is applied or not.
     */
    function getActive(){
        return active;
    }

    /**
     * Returns severity value of Severity.
     */
    function getSeverity() {
        return properties.severity;
    }

    /**
     * Disables interaction with Severity.
     */
    function disable() {
        severityElement.setAttribute("disabled", true);
    }

    /**
     * Enables interaction with Severity.
     */
    function enable() {
        severityElement.setAttribute("disabled", false);
    }

    self.handleOnClickCallback = handleOnClickCallback;
    self.apply = apply;
    self.unapply = unapply;
    self.getActive = getActive;
    self.getSeverity = getSeverity;
    self.render = render;
    self.disable = disable;
    self.enable = enable;

    _init(params);

    return this;
}

/**
 * A Severity Bucket to store Severities.
 * 
 * @param bucket array containing Severities
 * @returns {SeverityBucket}
 * @constructor
 */
function SeverityBucket(inputSeverities) {
    let self = this;

    // List of severities.
    let bucket = inputSeverities || [];

    /**
     * Initialize SeverityBucket.
     */
    function _init() {
        for(let i = 1; i <= 5; i++ ){
            push(new Severity(i));
        }
    }

    /**
     * Add severity.
     * 
     * @param {*} severity
     */
    function push(severity) {
        bucket.push(severity);
    }

    /**
     * Render Severities in SeverityBucket.
     * @param {*} uiSeverityHolder UI element to render Severities in.
     */
    function render(uiSeverityHolder) {
        bucket.forEach(severity => severity.render(uiSeverityHolder));
    }

    /**
     * Unapply all Severities.
     */
    function unapplySeverities() {
        bucket.forEach(severity => severity.unapply());
    }

    /**
     * Return list of Severities.
     */
    function getSeverities() {
        return bucket;
    }

    /**
     * Return number of Severities.
     */
    function getSize() {
        return bucket.length;
    }

    /**
     * Return list of applied Severities.
     */
    function getAppliedSeverities() {
        return bucket.filter(severity => severity.getActive()).map(severity => severity.getSeverity());
    }

    /**
     * Disable interaction with Severities.
     */
    function disable() {
        bucket.forEach(severity => severity.disable());
    }
    
    /**
     * Enable interaction with Severities.
     */
    function enable() {
        $(".gallery-severity").prop("disabled", false);
    }

    self.push = push;
    self.render = render;
    self.unapplySeverities = unapplySeverities;
    self.getSeverities = getSeverities;
    self.getSize = getSize;
    self.getAppliedSeverities = getAppliedSeverities;
    self.disable = disable;
    self.enable = enable;

    _init();

    return this;
}

/**
 * A Tag module.
 * 
 * @param {*} params Properties of tag.
 * @returns {Tag}
 * @constructor
 */
function Tag (params) {
    let self = this;

    // UI element of Tag.
    let tagElement = null;

    // Properties of this Tag.
    let properties = {
        tag_id: undefined,
        label_type: undefined,
        tag: undefined
    };

    // Status of the tag.
    let status = {
        applied: false
    };

    /**
     * Initialize Tag.
     * 
     * @param {*} param Tag properties.
     */
    function _init (param) {
        Object.keys(param).forEach( attrName => properties[attrName] = param[attrName]);

        tagElement = document.createElement('button');
        tagElement.className = "gallery-tag";
        tagElement.id = properties.tag;
        tagElement.innerText = properties.tag;
        tagElement.disabled = true;

        tagElement.onclick = handleTagClickCallback;
    }

    /**
     * Handles what happens when Tag is clicked.
     */
    function handleTagClickCallback() {
        if (status.applied) {
            sg.tracker.push("TagUnapply", null, {
                Tag: properties.tag,
                Label_Type: properties.label_type
            });
            unapply();
        } else {
            sg.tracker.push("TagApply", null, {
                Tag: properties.tag,
                Label_Type: properties.label_type
            });
            apply();
        }

        sg.cardContainer.updateCardsByTag();
    }

    /**
     * Applies Tag.
     */
    function apply() {
        setStatus("applied", true);
        console.log("clicked and toggled on");
        tagElement.setAttribute("style", "background-color: #78c8aa");
    }

    /**
     * Unapplies Tag.
     */
    function unapply() {
        setStatus("applied", false);
        console.log("clicked and toggled off");
        tagElement.setAttribute("style", "background-color: none");
    }

    /**
     * Returns Tag name.
     */
    function getTag() {
        return properties.tag;
    }

    /**
     * Returns the tagId of this Tag.
     */
    function getTagId() {
        return properties.tag_id;
    }

    /**
     * Returns label type of Tag.
     */
    function getLabelType() {
        return properties.label_type;
    }

    /**
     * Return the deep copy of the properties object, so the caller can only modify properties from setProperty().
     * 
     * JavaScript Deepcopy:
     * http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-a-javascript-object
     */
    function getProperties() { return $.extend(true, {}, properties); }

    /**
     * Gets property of Tag.
     * 
     * @param propName Property name.
     * @returns {*} Property value if property name is valid. Otherwise false.
     */
    function getProperty(propName) { return (propName in properties) ? properties[propName] : false; }

    /**
     * Get status of tag.
     */
    function getStatus() {
        return status;
    }

    /**
     * Sets a property of Tag.
     * 
     * @param key Property name.
     * @param value Property value.
     * @returns {setProperty}
     */
    function setProperty (key, value) {
        properties[key] = value;
        return this;
    }

    /**
     * Set status attribute of tag.
     * 
     * @param {*} key Status name.
     * @param {*} value Status value.
     */
    function setStatus(key, value) {
        if (key in status) {
            status[key] = value;
        } else {
            throw self.className + ": Illegal status name.";
        }
    }

    /**
     * Renders the Tag.
     * 
     * @param filterContainer UI element to render Tag in.
     * @returns {self}
     */
    function render(filterContainer) {
        filterContainer.append(tagElement);
    }

    self.apply = apply;
    self.unapply = unapply;
    self.getTag = getTag;
    self.getTagId = getTagId;
    self.getLabelType = getLabelType;
    self.getProperties = getProperties;
    self.getProperty = getProperty;
    self.getStatus = getStatus;
    self.setProperty = setProperty;
    self.setStatus = setStatus;
    self.render = render;

    _init(params);
    return this;
}

/**
 * A Tag Bucket to store Tags.
 * 
 * @param bucket array containing Tags
 * @returns {TagBucket}
 * @constructor
 */
function TagBucket(inputTags) {
    let self = this;

    // List of Tags.
    let bucket = inputTags || [];

    /**
     * Add Tag.
     * 
     * @param {*} tag Tag to add.
     */
    function push(tag) {
        bucket.push(tag);
    }

    /**
     * Render all Tags.
     * 
     * @param {*} uiTagHolder UI element to render Tags in.
     */
    function render(uiTagHolder) {
        bucket.forEach(tag => tag.render(uiTagHolder));
    }

    /**
     * Unapply all tags.
     */
    function unapplyTags() {
        bucket.forEach(tag => tag.unapply());
    }

    /**
     * Return list of Tags.
     */
    function getTags() {
        return bucket;
    }

    /**
     * Return number of Tags.
     */
    function getSize() {
        return bucket.length;
    }

    /**
     * Return list of applied Tags.
     */
    function getAppliedTags() {
        return bucket.filter(tag => tag.getStatus().applied);
    }

    self.push = push;
    self.render = render;
    self.unapplyTags = unapplyTags;
    self.getTags = getTags;
    self.getSize = getSize;
    self.getAppliedTags = getAppliedTags;

    return this;
}

/**
 * A Validation Menu to be appended to a Card for validation purposes.
 * 
 * @param uiCardImage The html element to append the validation menu to.
 * @param cardProperties Properties of the label the validation menu is being appended to
 * @returns {ValidationMenu}
 * @constructor
 */
function ValidationMenu(uiCardImage, cardProperties) {
    let resultOptions = {
        "Agree": 1, 
        "Disagree": 2,
        "NotSure": 3
    };

    let currSelected = null;

    const overlayHTML = `
        <div id="gallery-validation-button-holder">
            <button id="gallery-card-agree-button" class="validation-button">Agree</button>
            <button id="gallery-card-disagree-button" class="validation-button">Disagree</button>
            <button id="gallery-card-not-sure-button" class="validation-button">Not Sure</button>
        </div>
    `;

    let overlay = $(overlayHTML);

    let agreeButton = overlay.find("#gallery-card-agree-button");
    let disagreeButton = overlay.find("#gallery-card-disagree-button");
    let notSureButton = overlay.find("#gallery-card-not-sure-button");

    function _init() {
        // TODO: compress this code.
        agreeButton.click(function() {
            if (currSelected) {
                currSelected.attr('class', 'validation-button');
            }

            currSelected = agreeButton;
            agreeButton.attr('class', 'validation-button-selected');

            validateLabel("Agree");
        });
        
        disagreeButton.click(function() {
            if (currSelected) {
                currSelected.attr('class', 'validation-button');
            }

            currSelected = disagreeButton;
            disagreeButton.attr('class', 'validation-button-selected');

            validateLabel("Disagree");
        });
        
        notSureButton.click(function() {
            if (currSelected) {
                currSelected.attr('class', 'validation-button');
            }

            currSelected = notSureButton;
            notSureButton.attr('class', 'validation-button-selected');

            validateLabel("NotSure");
        });

        uiCardImage.appendChild(overlay[0]);
    }

    /**
     * Consolidate data on the validation and submit as a POST request.
     * 
     * @param action Validation result.
     * @private
     */
    function validateLabel(action) {
        console.log("validate method called");

        // TODO: do we need this log?
        sg.tracker.push("Validate_MenuClick=" + action);
        let validationTimestamp = new Date().getTime();

        let data = {
            label_id: cardProperties.label_id,
            label_type: cardProperties.label_type,
            validation_result: resultOptions[action],
            canvas_x: cardProperties.canvas_x,
            canvas_y: cardProperties.canvas_y,
            heading: cardProperties.heading,
            pitch: cardProperties.pitch,
            zoom: cardProperties.zoom,
            canvas_height: cardProperties.canvas_height,
            canvas_width: cardProperties.canvas_width,
            start_timestamp: validationTimestamp,
            end_timestamp: validationTimestamp,
            is_mobile: false
        };

        // Submit the validation via POST request.
        $.ajax({
            async: true,
            contentType: 'application/json; charset=utf-8',
            url: "/labelmap/validate",
            type: 'post',
            data: JSON.stringify(data),
            dataType: 'json',
            success: function (result) {
                showConfirmation(action);
            },
            error: function (result) {
                console.error(result);
            }
        });
    }

    /**
     * Confirm successful submit of validation.
     * TODO: Probably want to remove for prod or show confirmation through something else.
     * 
     * @param {*} action Validation result.
     */
    function showConfirmation(action) {
        console.log(action + ": validation submitted successfully :)");
    }

    _init();
    return this;
}

/** @namespace */
var sg = sg || {};

/**
 * Main module for SidewalkGallery.
 * @param params Object passed from gallery.scala.html containing initial values pulled from the database on page
 *              load.
 * @returns {Main}
 * @constructor
 */
function Main (params) {
    let self = this;

    function _initUI() {
        sg.ui = {};

        // Initializes filter components in side bar.
        sg.ui.cardFilter = {};
        sg.ui.cardFilter.holder = $("#card-filter");
        sg.ui.cardFilter.tags = $("#tags");
        sg.ui.cardFilter.severity = $("#severity");

        // Initializes label select component in side bar.
        sg.ui.ribbonMenu = {};
        sg.ui.ribbonMenu.holder = $("#ribbon-menu-holder");
        sg.ui.ribbonMenu.select = $('#label-select');

        // TODO: potentially remove if we decide sorting is not desired for later versions.
        sg.ui.cardSortMenu = {};
        sg.ui.cardSortMenu.holder = $("#card-sort-menu-holder");
        sg.ui.cardSortMenu.sort = $('#card-sort-select');

        // Initialize card container component.
        sg.ui.cardContainer = {};
        sg.ui.cardContainer.holder = $("#image-card-container");
        sg.ui.cardContainer.prevPage = $("#prev-page");
        sg.ui.cardContainer.pageNumber = $("#page-number")
        sg.ui.cardContainer.nextPage = $("#next-page");
    }

    function _init() {
        console.log("Gallery initialized");
        sg.rootDirectory = ('rootDirectory' in params) ? params.rootDirectory : '/';

        // Initialize functional components of UI elements.
        sg.ribbonMenu = new RibbonMenu(sg.ui.ribbonMenu);
        // sg.cardSortMenu = new CardSortMenu(sg.ui.cardSortMenu);
        sg.tagContainer = new CardFilter(sg.ui.cardFilter, sg.ribbonMenu);
        sg.cardContainer = new CardContainer(sg.ui.cardContainer);

        // Initialize data collection.
        sg.form = new Form(params.dataStoreUrl, params.beaconDataStoreUrl)
        sg.tracker = new Tracker();

        sg.util = {};
    }

    // Gets all the text on the gallery page for the correct language.
    // TODO: currently translations not available.
    i18next.use(i18nextXHRBackend);
    i18next.init({
        backend: { loadPath: '/assets/locales/{{lng}}/{{ns}}.json' },
        fallbackLng: 'en',
        ns: ['gallery', 'common'],
        defaultNS: 'gallery',
        lng: params.language,
        debug: false
    }, function(err, t) {
        if (err) return console.log('something went wrong loading', err);
        i18next.t('key');
    });

    _initUI();
    _init();

    return self;
}
