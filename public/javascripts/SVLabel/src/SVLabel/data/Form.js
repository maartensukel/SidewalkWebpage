/**
 *
 * @param labelContainer
 * @param navigationModel
 * @param neighborhoodModel
 * @param panoramaContainer
 * @param taskContainer
 * @param tracker
 * @param params
 * @returns {{className: string}}
 * @constructor
 */
function Form (labelContainer, navigationModel, neighborhoodModel, panoramaContainer, taskContainer, tracker, params) {
    var self = this;
    var properties = {
        commentFieldMessage: undefined,
        previousLabelingTaskId: undefined,
        dataStoreUrl : undefined,
        taskRemaining : 0,
        taskDescription : undefined,
        taskPanoramaId: undefined,
        userExperiment: false
    };

    var status = {
        disabledButtonMessageVisibility: 'hidden',
        disableSkipButton : false,
        disableSubmit : false,
        radioValue: undefined,
        skipReasonDescription: undefined,
        submitType: undefined,
        taskDifficulty: undefined,
        taskDifficultyComment: undefined
    };

    var lock = {
        disableSkipButton : false,
        disableSubmit : false
    };

    /**
     * This method gathers all the data needed for submission.
     * @returns {{}}
     */
    this.compileSubmissionData = function (task) {
        var data = {};

        data.audit_task = {
            street_edge_id: task.getStreetEdgeId(),
            task_start: task.getTaskStart(),
            audit_task_id: task.getAuditTaskId(),
            completed: task.isCompleted()
        };

        data.environment = {
            browser: util.getBrowser(),
            browser_version: util.getBrowserVersion(),
            browser_width: $(window).width(),
            browser_height: $(window).height(),
            screen_width: screen.width,
            screen_height: screen.height,
            avail_width: screen.availWidth,		// total width - interface (taskbar)
            avail_height: screen.availHeight,		// total height - interface };
            operating_system: util.getOperatingSystem()
        };

        data.interactions = tracker.getActions();
        tracker.refresh();

        data.labels = [];
        var labels = labelContainer.getCurrentLabels();
        for(var i = 0, labelLen = labels.length; i < labelLen; i += 1) {
            var label = labels[i];
            var prop = label.getProperties();
            var points = label.getPath().getPoints();
            var labelLatLng = label.toLatLng();

            var temp = {
                deleted : label.isDeleted(),
                label_id : label.getLabelId(),
                label_type : label.getLabelType(),
                photographer_heading : prop.photographerHeading,
                photographer_pitch : prop.photographerPitch,
                panorama_lat: prop.panoramaLat,
                panorama_lng: prop.panoramaLng,
                temporary_label_id: label.getProperty('temporary_label_id'),
                gsv_panorama_id : prop.panoId,
                label_points : [],
                severity: label.getProperty('severity'),
                temporary_problem: label.getProperty('temporaryProblem'),
                description: label.getProperty('description')
            };

            for (var j = 0, pathLen = points.length; j < pathLen; j += 1) {
                var point = points[j],
                    gsvImageCoordinate = point.getGSVImageCoordinate(),
                    pointParam = {
                        sv_image_x : gsvImageCoordinate.x,
                        sv_image_y : gsvImageCoordinate.y,
                        canvas_x: point.originalCanvasCoordinate.x,
                        canvas_y: point.originalCanvasCoordinate.y,
                        heading: point.originalPov.heading,
                        pitch: point.originalPov.pitch,
                        zoom : point.originalPov.zoom,
                        canvas_height : prop.canvasHeight,
                        canvas_width : prop.canvasWidth,
                        alpha_x : prop.canvasDistortionAlphaX,
                        alpha_y : prop.canvasDistortionAlphaY,
                        lat : null,
                        lng : null
                    };

                if (labelLatLng) {
                    pointParam.lat = labelLatLng.lat;
                    pointParam.lng = labelLatLng.lng;
                }
                temp.label_points.push(pointParam);
            }

            data.labels.push(temp)
        }

        // Keep Street View meta data. This is particularly important to keep track of the date when the images were taken (i.e., the date of the accessibilty attributes).
        data.gsv_panoramas = [];

        var temp;
        var panoramaData;
        var link;
        var links;
        var panoramas = panoramaContainer.getStagedPanoramas();
        for (var i = 0, panoramaLen = panoramas.length; i < panoramaLen; i++) {
            panoramaData = panoramas[i].data();
            links = [];
            if ("links" in panoramaData) {
                for (j = 0; j < panoramaData.links.length; j++) {
                    link = panoramaData.links[j];
                    links.push({
                        target_gsv_panorama_id: ("pano" in link) ? link.pano : "",
                        yaw_deg: ("heading" in link) ? link.heading : 0.0,
                        description: ("description" in link) ? link.description : ""
                    });
                }
            }
            temp = {
                panorama_id: ("location" in panoramaData && "pano" in panoramaData.location) ? panoramaData.location.pano : "",
                image_date: "imageDate" in panoramaData ? panoramaData.imageDate : "",
                links: links,
                copyright: "copyright" in panoramaData ? panoramaData.copyright : ""
            };
            data.gsv_panoramas.push(temp);
            panoramas[i].setProperty("submitted", true);
        }

        return data;
    };
    

    /**
     * Disable clicking the submit button
     * @returns {*}
     */
    function disableSubmit () {
        if (!lock.disableSubmit) {
            status.disableSubmit = true;
            //  $btnSubmit.attr('disabled', true);
            //$btnSubmit.css('opacity', 0.5);
            return this;
        }
        return false;
    }

    /**
     * Disable clicking the skip button
     * @returns {*}
     */
    function disableSkip () {
        if (!lock.disableSkip) {
            status.disableSkip = true;
            // $btnSkip.attr('disabled', true);
            //$btnSkip.css('opacity', 0.5);
            return this;
        } else {
            return false;
        }
    }

    /**
     * Enable clicking the submit button
     * @returns {*}
     */
    function enableSubmit () {
        if (!lock.disableSubmit) {
            status.disableSubmit = false;
            return this;
        } else {
            return false;
        }
    }

    /**
     * Enable clicking the skip button
     * @returns {*}
     */
    function enableSkip () {
        if (!lock.disableSkip) {
            status.disableSkip = false;
            return this;
        } else {
            return false;
        }
    }

    /** This method returns whether the task is in preview mode or not. */
    function isPreviewMode () {
        return properties.isPreviewMode;
    }

    function lockDisableSubmit () {
        lock.disableSubmit = true;
        return this;
    }

    function lockDisableSkip () {
        lock.disableSkip = true;
        return this;
    }

    /**
     * Post a json object
     * @param url
     * @param data
     * @param callback
     * @param async
     */
    function postJSON (url, data, callback, async) {
        if (!async) async = true;
        $.ajax({
            async: async,
            contentType: 'application/json; charset=utf-8',
            url: url,
            type: 'post',
            data: JSON.stringify(data),
            dataType: 'json',
            success: function (result) {
                if (callback) callback(result);
            },
            error: function (result) {
                console.error(result);
            }
        });
    }

    function setPreviousLabelingTaskId (val) {
        properties.previousLabelingTaskId = val;
        return this;
    }

    /** This method sets the taskDescription */
    function setTaskDescription (val) {
        properties.taskDescription = val;
        return this;
    }

    /** This method sets the taskPanoramaId. Note it is not same as the GSV panorama id. */
    function setTaskPanoramaId (val) {
        properties.taskPanoramaId = val;
        return this;
    }

    /** This method sets the number of remaining tasks */
    function setTaskRemaining (val) {
        properties.taskRemaining = val;
        return this;
    }

    self._prepareSkipData = function (issueDescription) {
        var position = navigationModel.getPosition();
        return {
            issue_description: issueDescription,
            lat: position.lat,
            lng: position.lng
        };
    };

    self.skip = function (task, skipReasonLabel) {
        var data = self._prepareSkipData(skipReasonLabel);

        if (skipReasonLabel == "GSVNotAvailable") {
            task.complete();
            taskContainer.push(task);
            util.misc.reportNoStreetView(task.getStreetEdgeId());
        }

        task.eraseFromGoogleMaps();
        self.skipSubmit(data, task);

        var nextTask = taskContainer.nextTask(task);
        if (!nextTask) {
            var currentNeighborhood = neighborhoodModel.currentNeighborhood();
            var currentNeighborhoodId = currentNeighborhood.getProperty("regionId");
            neighborhoodModel.neighborhoodCompleted(currentNeighborhoodId);
            nextTask = taskContainer.nextTask();
        }
        taskContainer.initNextTask(nextTask);
    };

    /**
     * Submit the data collected so far and move to another location.
     * 
     * @param dataIn An object that has issue_description, lat, and lng as fields.
     * @returns {boolean}
     */
    function skipSubmit (dataIn, task) {
        tracker.push('TaskSkip');

        var data = self.compileSubmissionData(task);
        data.incomplete = dataIn;

        self.submit(data, task);
        return false;
    }

    /**
     * Submit the data.
     * @param data This can be an object of a compiled data for auditing, or an array of
     * the auditing data.
     */
    this.submit = function (data, task, async) {
        if (typeof async == "undefined") { async = true; }

        if (data.constructor !== Array) { data = [data]; }

        if ('interactions' in data[0] && data[0].constructor === Array) {
            var action = tracker.create("TaskSubmit");
            data[0].interactions.push(action);
        }

        labelContainer.refresh();
        $.ajax({
            async: async,
            contentType: 'application/json; charset=utf-8',
            url: properties.dataStoreUrl,
            type: 'post',
            data: JSON.stringify(data),
            dataType: 'json',
            success: function (result) {
                if (result) task.setProperty("auditTaskId", result.audit_task_id);
            },
            error: function (result) {
                console.error(result);
            }
        });
    };

    /** Unlock disable submit */
    function unlockDisableSubmit () {
        lock.disableSubmit = false;
        return this;
    }

    /** Unlock disable skip */
    function unlockDisableSkip () {
        lock.disableSkipButton = false;
        return this;
    }

    self.disableSubmit = disableSubmit;
    self.disableSkip = disableSkip;
    self.enableSubmit = enableSubmit;
    self.enableSkip = enableSkip;
    self.isPreviewMode = isPreviewMode;
    self.lockDisableSubmit = lockDisableSubmit;
    self.lockDisableSkip = lockDisableSkip;
    self.postJSON = postJSON;
    self.setPreviousLabelingTaskId = setPreviousLabelingTaskId;
    self.setTaskDescription = setTaskDescription;
    self.setTaskRemaining = setTaskRemaining;
    self.setTaskPanoramaId = setTaskPanoramaId;
    self.skipSubmit = skipSubmit;
    self.unlockDisableSubmit = unlockDisableSubmit;
    self.unlockDisableSkip = unlockDisableSkip;

    properties.dataStoreUrl = params.dataStoreUrl;

    $(window).on('beforeunload', function () {
        tracker.push("Unload");
        var task = taskContainer.getCurrentTask();
        var data = self.compileSubmissionData(task);
        self.submit(data, task, false);
    });
}
