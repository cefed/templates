(function($j){$j.fn.touchwipe=function(settings){var config={min_move_x:20,min_move_y:20,wipeLeft:function(){},wipeRight:function(){},wipeUp:function(){},wipeDown:function(){},preventDefaultEvents:true};if(settings)$j.extend(config,settings);this.each(function(){var startX;var startY;var isMoving=false;function cancelTouch(){this.removeEventListener('touchmove',onTouchMove);startX=null;isMoving=false}function onTouchMove(e){if(config.preventDefaultEvents){e.preventDefault()}if(isMoving){var x=e.touches[0].pageX;var y=e.touches[0].pageY;var dx=startX-x;var dy=startY-y;if(Math.abs(dx)>=config.min_move_x){cancelTouch();if(dx>0){config.wipeLeft()}else{config.wipeRight()}}else if(Math.abs(dy)>=config.min_move_y){cancelTouch();if(dy>0){config.wipeDown()}else{config.wipeUp()}}}}function onTouchStart(e){if(e.touches.length==1){startX=e.touches[0].pageX;startY=e.touches[0].pageY;isMoving=true;this.addEventListener('touchmove',onTouchMove,false)}}if('ontouchstart'in document.documentElement){this.addEventListener('touchstart',onTouchStart,false)}});return this}})(jQuery);
function configureGallery(gallerySettings) {
    gallerySettings.IsLoaded = false;
    gallerySettings.PluginWrapper = $j("#photoPluginWrapper" + gallerySettings.PluginID);
    gallerySettings.MaxIndex = 0;
    gallerySettings.running = true;
    gallerySettings.CurrentIndex = 0;
    gallerySettings.LastIndex = 0;
    gallerySettings.Timer = null;
    gallerySettings.Animated = false;
    gallerySettings.Category = 0;
    gallerySettings.CurrentDivID = "";
    gallerySettings.EmailImageID = 0;
    gallerySettings.LoadCount = 0;
    gallerySettings.HideControlsTimer = null;
    gallerySettings.LightboxIndex = -1;
    gallerySettings.PreLoadTimer = null;
    if (gallerySettings.EnableEmailPhoto) {
        gallerySettings.EmailPhotoDiv = $j("<div/>").addClass("divEmailPhoto").attr("id", "divEmailPhoto" + gallerySettings.PluginID).attr("title", "Email This Image").click(function () { gallerySettings.EmailImage(); }).appendTo(gallerySettings.PluginWrapper);
    }
    gallerySettings.PluginLoadFinished = function () {
        if (gallerySettings.OnPluginLoadFinish == "") return;
        var allLoaded = true;
        for (var _album in _photoAlbums) {
            if (!_photoAlbums[_album].IsLoaded) allLoaded = false;
        }
        if (!allLoaded) {
            window.setTimeout("_photoAlbums.a" + gallerySettings.PluginID + ".PluginLoadFinished();", 500);
            return;
        }
        eval(gallerySettings.OnPluginLoadFinish);
    };
    gallerySettings.BeforeImageChange = function (Index, ActionLink, ActionLinkClass) {
        if (gallerySettings.OnBeforeImageChange == "") return;
        eval(gallerySettings.OnBeforeImageChange);
    };
    gallerySettings.BeforeTransitionStarts = function (Index, ActionLink, ActionLinkClass) {
        if (gallerySettings.OnBeforeTransitionStarts == "") return;
        eval(gallerySettings.OnBeforeTransitionStarts);
    };
    gallerySettings.AfterImageChange = function (NewDivID) {
        if (gallerySettings.OnAfterImageChange == "") return;
        eval(gallerySettings.OnAfterImageChange);
    };
    gallerySettings.BeforeCategoryChange = function (catDrp) {
        if (gallerySettings.OnBeforeCategoryChange == "") return;
        eval(gallerySettings.OnBeforeCategoryChange);
    };
    gallerySettings.AfterCategoryChange = function (catDrp) {
        if (gallerySettings.OnAfterCategoryChange == "") return;
        eval(gallerySettings.OnAfterCategoryChange);
    };
    gallerySettings.GetImagePath = function (imageId) {
        if (gallerySettings.SiteDomainPath.indexOf("LunchAndLearnTrainingSite") !== -1) {
            return gallerySettings.ImagePath.replace(gallerySettings.SiteDomainPath, "http://cdn" + (imageId % 20) + ".clubessential.com") + "?ID=" + imageId;
        } else {
            return gallerySettings.ImagePath + "?ID=" + imageId;
        }
    }
    gallerySettings.SetCategory = function (catDrp) {
        gallerySettings.BeforeCategoryChange(catDrp);
        gallerySettings.CurrentIndex = 0;
        gallerySettings.LastIndex = 0;
        if ($j(catDrp).length != 0) gallerySettings.Category = $j(catDrp).val();
        gallerySettings.SetCategoryDrops();
        gallerySettings.SetMaxIndex();
        if ($j(catDrp).length != 0) {
            gallerySettings.ChangeImage(0, catDrp);
        } else {
            gallerySettings.ChangeImage(0, null, "photoPlgCatDrop" + gallerySettings.PluginID);
        }
        gallerySettings.AfterCategoryChange(catDrp);
    };
    gallerySettings.SetMaxIndex = function () {
        gallerySettings.MaxIndex = gallerySettings.GetMaxIndex(gallerySettings.Category);
    };
    gallerySettings.GetMaxIndex = function (CategoryID) {
        var InitialCount = 0;
        if (CategoryID === 0) {
            InitialCount = gallerySettings.OrderedImages.length - 1;
        } else {
            InitialCount = gallerySettings.GetCategory(CategoryID).CategoryImages.length - 1;
        }
        if (gallerySettings.DisplayType === 5) {
            InitialCount = InitialCount + 1;
            var TotalPages = parseInt(InitialCount / gallerySettings.ThumbsPerPage);
            if (TotalPages * gallerySettings.ThumbsPerPage < InitialCount) TotalPages = TotalPages + 1;
            if (gallerySettings.WrapScrolling) {
                if (InitialCount < gallerySettings.ThumbsPerPage || InitialCount % gallerySettings.ThumbsPerPage === 0) {
                    InitialCount = TotalPages - 1;
                } else {
                    InitialCount = ((InitialCount % gallerySettings.ThumbsPerPage) * InitialCount) - 1;
                }
            } else {
                InitialCount = TotalPages - 1;
            }
        }
        return InitialCount;
    };
    gallerySettings.GetCategory = function (categoryId) {
        var cat = null;
        $j.each(gallerySettings.Categories, function (key, Category) {
            if (categoryId == Category.CategoryID) cat = Category;
        });
        return cat;
    };
    gallerySettings.SetDisplayImageTime = function (timeDrp) {
        gallerySettings.DisplayImageTime = $j(timeDrp).val();
        gallerySettings.StartRotation();
        gallerySettings.SetTimerDrops();
    };
    gallerySettings.ToggleTimer = function (aTag) {
        var tag = $j(aTag);
        if (gallerySettings.running) {
            window.clearTimeout(gallerySettings.Timer);
            tag.html(gallerySettings.UserScrollPlayText);
        } else {
            gallerySettings.StartRotation();
            tag.html(gallerySettings.UserScrollPauseText);
        }
        gallerySettings.running = !gallerySettings.running;
    };
    gallerySettings.ExternalChangeImage = function (Index) {
        var dirID = (gallerySettings.CurrentIndex < Index) ? "nextImg" + gallerySettings.PluginID : "prevImg" + gallerySettings.PluginID;
        gallerySettings.ChangeImage(Index, null, dirID);
    };
    gallerySettings.ChangeImage = function (Index, ActionLink, ActionLinkClass) {
        if ($j(ActionLink).length) ActionLinkClass = $j(ActionLink).attr("class");
        if (!gallerySettings.Animated) {
            gallerySettings.BeforeImageChange(Index, ActionLink, ActionLinkClass);
            var NewDivID = gallerySettings.LoadImageDiv(Index);
            gallerySettings.SetTimerDrops();
            gallerySettings.SetCategoryDrops();
            gallerySettings.LastIndex = gallerySettings.CurrentIndex;
            gallerySettings.CurrentIndex = Index;
            if (gallerySettings.CurrentDivID == NewDivID) return;
            gallerySettings.BeforeTransitionStarts(Index, ActionLink, ActionLinkClass);
            gallerySettings.TransitionIn(gallerySettings.CurrentDivID, NewDivID, ActionLinkClass);
            gallerySettings.CurrentDivID = NewDivID;
        }
    };
    gallerySettings.InitCarousel = function () {
        var wrapperDiv = gallerySettings.PluginWrapper;
        wrapperDiv.attr("id", "");
        var initialHtml = gallerySettings.HtmlItemTemplate;
        initialHtml = initialHtml.replace("##THUMBSTABLE##", "<div id=\"photoPluginWrapper" + gallerySettings.PluginID + "\" class=\"photoPluginWrapper\"></div>")
        initialHtml = initialHtml.replace("##IMAGECOUNTER##", "<span id=\"imageCounter" + gallerySettings.PluginID + "\">Page&nbsp;1&nbsp;of&nbsp;" + (gallerySettings.MaxIndex + 1) + "</span>")
        initialHtml = initialHtml.replace("##CURRENTIMAGENUMBER##", "<span id=\"currentImageNumber" + gallerySettings.PluginID + "\">1</span>")
        initialHtml = initialHtml.replace("##TOTALIMAGESCOUNT##", "<span id=\"totalImagesCount" + gallerySettings.PluginID + "\">" + (gallerySettings.MaxIndex + 1) + "</span>")
        wrapperDiv.html(initialHtml);
        gallerySettings.PluginWrapper = $j("#photoPluginWrapper" + gallerySettings.PluginID);
    };
    gallerySettings.ChangePage = function (Index, ActionLink, ActionLinkClass, directIndex) {
        if (!gallerySettings.Animated) {
            Index = (directIndex || directIndex == 0) ? directIndex : gallerySettings.CurrentIndex + Index;
            if (Index > gallerySettings.MaxIndex) { Index = 0; } else if (Index < 0) { Index = gallerySettings.MaxIndex; }
            if ($j(ActionLink).length) ActionLinkClass = $j(ActionLink).attr("class");
            gallerySettings.BeforeImageChange();
            var NewDivID = gallerySettings.LoadPageDiv(Index);
            gallerySettings.LastIndex = gallerySettings.CurrentIndex;
            gallerySettings.CurrentIndex = Index;
            if (gallerySettings.CurrentDivID == NewDivID) return;
            gallerySettings.BeforeTransitionStarts();
            gallerySettings.TransitionIn(gallerySettings.CurrentDivID, NewDivID, ActionLinkClass);
            gallerySettings.CurrentDivID = NewDivID;
            if ($j("#imageDrop_" + gallerySettings.PluginID).length > 0) $j("#imageDrop_" + gallerySettings.PluginID).attr("selectedIndex", gallerySettings.CurrentIndex);
        }
    };
    gallerySettings.LoadPageDiv = function (Index) {
        var NewDivID = "phtGalleryWrapDiv_" + gallerySettings.PluginID + "_" + gallerySettings.Category + "_" + Index;
        if (!$j("#" + NewDivID).length) {
            var Div = gallerySettings.GetCarouselPage(gallerySettings.PluginID, gallerySettings.Category, Index);
            $j("<div/>").addClass("photoGalleryThumbPageDiv").attr("id", NewDivID).html(Div).hide().appendTo("#photoPluginWrapper" + gallerySettings.PluginID);
            $j("#" + NewDivID).find(".carouselThumbnail").hover(function () {
                $j(this).addClass("hover");
            }, function () {
                $j(this).removeClass("hover");
            });
        }
        return NewDivID;
    };
    gallerySettings.GetCarouselPage = function (PluginID, CategoryID, PageIndex) {

        if (!gallerySettings) return;
        var Images;

        if (gallerySettings.Categories.length === 1 || !gallerySettings.ShowCatDrop || CategoryID === 0) {
            Images = gallerySettings.OrderedImages;
        } else {
            Images = gallerySettings.GetCategory(CategoryID).CategoryImages;
        }

        var ThumbsPerPage = gallerySettings.ThumbsPerPage;
        var Columns = gallerySettings.Columns;

        if (ThumbsPerPage === -1) ThumbsPerPage = Images.length;
        if (Columns === -1) Columns = Images.length;

        var Thumbs = new Array();

        if (gallerySettings.WrapScrolling && Images.length % ThumbsPerPage !== 0) {
            if (gallerySettings.LastScrollCategory !== CategoryID) gallerySettings.LastScrollIndex = 0;
            for (var i = 0; i <= ThumbsPerPage - 1; i++) {
                try {
                    if (gallerySettings.LastScrollIndex >= Images.length && Images.length > ThumbsPerPage) gallerySettings.LastScrollIndex = 0;
                    Thumbs.push(gallerySettings.GetCarouselImage(PluginID, Images[gallerySettings.LastScrollIndex], gallerySettings.LastScrollIndex, CategoryID, Images.length));
                    gallerySettings.LastScrollIndex = gallerySettings.LastScrollIndex + 1;
                    gallerySettings.LastScrollCategory = CategoryID;
                } catch (e) {
                }
            }
        } else {
            for (var i = (ThumbsPerPage * PageIndex); i <= (((PageIndex + 1) * ThumbsPerPage) - 1); i++) {
                try {
                    Thumbs.push(gallerySettings.GetCarouselImage(PluginID, Images[i], i, CategoryID, Images.length));
                } catch (e) {
                }
            }
        }

        if (Thumbs.length > 0) {
            var ThisPage = "";
            switch (gallerySettings.ThumbsTableLayout) {
                case 0: //table
                    ThisPage = "<table id=\"carousel_" + PluginID + "_" + PageIndex + "\" class=\"carousel carousel" + PluginID + "\">";
                    break;
                case 1: //flow
                    ThisPage = "<div id=\"carousel_" + PluginID + "_" + PageIndex + "\" class=\"carousel carousel" + PluginID + "\">";
                    break;
                case 2: //ul
                    ThisPage = "<ul id=\"carousel_" + PluginID + "_" + PageIndex + "\" class=\"carousel carousel" + PluginID + "\">";
                    break;
                default:
            }
            var RowCount = 0;
            var PageColumns = Columns;
            if (Thumbs.length <= PageColumns) {
                ThumbsPerPage = Thumbs.length;
                PageColumns = Thumbs.length;
            }
            RowCount = ThumbsPerPage / PageColumns;
            var Modulus = ThumbsPerPage % PageColumns;
            if (Modulus > 0) RowCount = RowCount + 1;
            if (PageColumns === 0) PageColumns = 3;
            var Index = -1;

            for (var i = 1; i <= RowCount; i++) {
                switch (gallerySettings.ThumbsTableLayout) {
                    case 0: //table
                        ThisPage = ThisPage + "<tr>";
                        break;
                    case 1: //flow
                        if (RowCount > 1) ThisPage = ThisPage + "<div id=\"carouselRowDIV_" + PluginID + "_" + PageIndex + "_" + i + "\" class=\"carouselRowDIV carouselRowDIV" + PluginID + "\">";
                        break;
                    case 2: //ul
                        if (RowCount > 1) ThisPage = ThisPage + "<li id=\"carouselRowLI_" + PluginID + "_" + PageIndex + "_" + i + "\" class=\"carouselRowLI carouselRowLI" + PluginID + "\"><ul id=\"carouselRow_" + PluginID + "_" + PageIndex + "_" + i + "\" class=\"carouselRow carouselRow" + PluginID + "\">";
                        break;
                    default:
                }
                for (var x = 1; x <= PageColumns; x++) {
                    switch (gallerySettings.ThumbsTableLayout) {
                        case 0: //table
                            ThisPage = ThisPage + "<td class=\"carouselThumbnail\">";
                            break;
                        case 1: //flow
                            break;
                        case 2: //ul
                            ThisPage = ThisPage + "<li class=\"carouselThumbnail\">";
                            break;
                        default:
                    }
                    try {
                        Index = Index + 1;
                        var Thumb = Thumbs[Index];
                        if (Thumb) ThisPage = ThisPage + Thumb;
                    } catch (e) {
                    }
                    switch (gallerySettings.ThumbsTableLayout) {
                        case 0: //table
                            ThisPage = ThisPage + "</td>";
                            break;
                        case 1: //flow
                            break;
                        case 2: //ul
                            ThisPage = ThisPage + "</li>";
                            break;
                        default:
                    }
                }
                switch (gallerySettings.ThumbsTableLayout) {
                    case 0: //table
                        ThisPage = ThisPage + "</tr>";
                        break;
                    case 1: //flow
                        if (RowCount > 1) ThisPage = ThisPage + "</div>";
                        break;
                    case 2: //ul
                        if (RowCount > 1) ThisPage = ThisPage + "</ul></li>";
                        break;
                    default:
                }
            }
            switch (gallerySettings.ThumbsTableLayout) {
                case 0: //table
                    ThisPage = ThisPage + "</table>";
                    break;
                case 1: //flow
                    ThisPage = ThisPage + "</div>";
                    break;
                case 2: //ul
                    ThisPage = ThisPage + "</ul>";
                    break;
                default:
            }
            return ThisPage;
        } else {
            return "";
        }
    };
    gallerySettings.GetCarouselImage = function (PluginID, Image, Index, CategoryID, TotalImages) {
        if (!gallerySettings) return "";
        var Thumbnail = gallerySettings.ThumbnailTemplate;
        var DefaultImageClass = "carouselImage carouselImage" + gallerySettings.PluginID;
        if (Image.ImageUrl === "") Thumbnail = Thumbnail.Replace(/##IMAGEURLLINK##/gi, "##IMAGE##");
        Thumbnail = Thumbnail.replace(/##STARTTHUMBLINK##/gi, "");
        Thumbnail = Thumbnail.replace(/##CATEGORYID##/gi, CategoryID);
        Thumbnail = Thumbnail.replace(/##INDEXID##/gi, Index);
        Thumbnail = Thumbnail.replace(/##INCREMENT##/gi, "##CURRENTIMAGENUMBER##");
        Thumbnail = Thumbnail.replace(/##CURRENTIMAGENUMBER##/gi, (Index + 1));
        Thumbnail = Thumbnail.replace(/##TOTALIMAGESCOUNT##/gi, TotalImages);
        Thumbnail = Thumbnail.replace(/##IMAGECOUNTER##/gi, "Image&nbsp;" + (Index + 1) + "&nbsp;of&nbsp;" + TotalImages);
        Thumbnail = Thumbnail.replace(/##NOACTIONIMAGE##/gi, "##IMAGE##");
        if (gallerySettings.ShowTooltip) {
            Thumbnail = Thumbnail.replace(/##IMAGE##/gi, "<img onload=\"_photoAlbums.a" + gallerySettings.PluginID + ".AdjustSize();\" class=\"" + DefaultImageClass + "\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\" title=\"" + gallerySettings.TooltipValue + "\">");
            Thumbnail = Thumbnail.replace(/##LIGHTBOXIMAGE##/gi, "<img onload=\"_photoAlbums.a" + gallerySettings.PluginID + ".AdjustSize();\" style=\"cursor: pointer;\" class=\"" + DefaultImageClass + "\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\" title=\"" + gallerySettings.TooltipValue + "\" onclick=\"_photoAlbums.a" + gallerySettings.PluginID + ".LightBox(" + Image.ImageID + ")\">");
            Thumbnail = Thumbnail.replace(/##MAXIMAGE##/gi, "<img onload=\"_photoAlbums.a" + gallerySettings.PluginID + ".AdjustSize();\" style=\"cursor: pointer;\" class=\"" + DefaultImageClass + "\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\" title=\"" + gallerySettings.TooltipValue + "\" onclick=\"window.open('" + gallerySettings.GetImagePath(Image.ImageID) + "')\">");
            Thumbnail = Thumbnail.replace(/##IMAGEURLLINK##/gi, "<a href=\"" + Image.ImageUrl + "\"><img onload=\"_photoAlbums.a" + gallerySettings.PluginID + ".AdjustSize();\" class=\"" + DefaultImageClass + "\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\" title=\"" + gallerySettings.TooltipValue + "\"></a>");
        } else {
            Thumbnail = Thumbnail.replace(/##IMAGE##/gi, "<img onload=\"_photoAlbums.a" + gallerySettings.PluginID + ".AdjustSize();\" class=\"" + DefaultImageClass + "\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\">");
            Thumbnail = Thumbnail.replace(/##LIGHTBOXIMAGE##/gi, "<img onload=\"_photoAlbums.a" + gallerySettings.PluginID + ".AdjustSize();\" style=\"cursor: pointer;\" class=\"" + DefaultImageClass + "\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\" onclick=\"_photoAlbums.a" + gallerySettings.PluginID + ".LightBox(" + Image.ImageID + ")\">");
            Thumbnail = Thumbnail.replace(/##MAXIMAGE##/gi, "<img onload=\"_photoAlbums.a" + gallerySettings.PluginID + ".AdjustSize();\" style=\"cursor: pointer;\" class=\"" + DefaultImageClass + "\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\" onclick=\"window.open('" + gallerySettings.GetImagePath(Image.ImageID) + "')\">");
            Thumbnail = Thumbnail.replace(/##IMAGEURLLINK##/gi, "<a href=\"" + Image.ImageUrl + "\"><img onload=\"_photoAlbums.a" + gallerySettings.PluginID + ".AdjustSize();\" class=\"" + DefaultImageClass + "\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\"></a>");
        }
        Thumbnail = Thumbnail.replace(/##ENDTHUMBLINK##/gi, "");
        Thumbnail = Thumbnail.replace(/##PLUGINID##/gi, gallerySettings.PluginID);
        Thumbnail = Thumbnail.replace(/##ACTION##/gi, "");
        Thumbnail = Thumbnail.replace(/##STARTIMAGEINDEX##/gi, "");
        Thumbnail = Thumbnail.replace(/##THUMBSIZE##/gi, "");
        Thumbnail = Thumbnail.replace(/##IMAGEID##/gi, Image.ImageID);
        Thumbnail = Thumbnail.replace(/##IMAGETITLE##/gi, Image.ImageName);
        Thumbnail = Thumbnail.replace(/##IMAGEDESC##/gi, Image.ImageLongDesc);
        if (Image.ImageUrl == null) {
            Thumbnail = Thumbnail.replace(/href=##IMAGEURL##/gi, "href=\"javascript:void(0);\"");
            Thumbnail = Thumbnail.replace(/href='##IMAGEURL##'/gi, "href=\"javascript:void(0);\"");
            Thumbnail = Thumbnail.replace(/href="##IMAGEURL##"/gi, "href=\"javascript:void(0);\"");
            Thumbnail = Thumbnail.replace(/##IMAGEURL##/gi, "");
        }
        Thumbnail = Thumbnail.replace(/##IMAGEURL##/gi, Image.ImageUrl);
        Thumbnail = Thumbnail.replace(/##IMAGEADDL1##/gi, Image.ImageCustom1);
        Thumbnail = Thumbnail.replace(/##IMAGEADDL2##/gi, Image.ImageCustom2);
        Thumbnail = Thumbnail.replace(/##IMAGEPATH##/gi, gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize);
        Thumbnail = Thumbnail.replace(/##CATEGORIESDROP##/gi, "");
        Thumbnail = Thumbnail.replace(/##USERTIMECONTROLS##/gi, "");
        Thumbnail = Thumbnail.replace(/##PAUSEBTN##/gi, "");
        Thumbnail = Thumbnail.replace(/##PREVIOUSIMAGE##/gi, "");
        Thumbnail = Thumbnail.replace(/##NEXTIMAGE##/gi, "");
        Thumbnail = Thumbnail.replace(/##THUMBSTABLE##/gi, "");
        return Thumbnail;
    };
    gallerySettings.ChangeImageFromDrop = function (drop) {
        var newIndex = drop.selectedIndex;
        var dirID = (newIndex > gallerySettings.CurrentIndex) ? "nextImg" + gallerySettings.PluginID : "prevImg" + gallerySettings.PluginID;
        gallerySettings.ChangeImage(newIndex, null, dirID);
    };
    gallerySettings.LoadImageDiv = function (Index, CategoryID) {
        if (gallerySettings.DisplayType === 5) return gallerySettings.LoadPageDiv(Index);
        var thisMaxIndex = (CategoryID) ? gallerySettings.GetMaxIndex(CategoryID) : gallerySettings.MaxIndex;
        CategoryID = (CategoryID) ? CategoryID : gallerySettings.Category;
        if (Index > thisMaxIndex || Index < 0) return;
        var NewDivID = "phtGalleryWrapDiv_" + gallerySettings.PluginID + "_" + CategoryID + "_" + Index;
        if (!$j("#" + NewDivID).length) {
            var divIsLoaded = 1;
            var image = gallerySettings.loadImage(gallerySettings.PluginID, CategoryID, Index);
            if (image.indexOf(".SetLoaded('##THISDIVID##')") !== -1) {
                image = image.replace("##THISDIVID##", NewDivID)
                divIsLoaded = 0;
            }
            $j("<div/>").addClass("photoGalleryWrapDiv").attr("id", NewDivID).html(image).attr("isloaded", divIsLoaded).hide().appendTo("#photoPluginWrapper" + gallerySettings.PluginID);
        
        }
        return NewDivID;
    };
    gallerySettings.SetLoaded = function (DivID) {
        $j("#" + DivID).attr("isloaded", "1");
    }
    gallerySettings.loadImage = function (PluginID, CategoryID, ImageIndex) {
        if (!gallerySettings) return;
        var Images;
        if (gallerySettings.Categories.length == 1 || !gallerySettings.ShowCatDrop || CategoryID == 0) {
            Images = gallerySettings.OrderedImages;
        } else {
            Images = gallerySettings.GetCategory(CategoryID).CategoryImages;
        }
        var Image;
        try {
            Image = Images[ImageIndex];
        } catch (e) {
            return;
        }
        var NextIndex = ImageIndex + 1;
        var PrevIndex = ImageIndex - 1;
        var NextOnClick = null;
        var PrevOnClick = null;
        if (PrevIndex < 0) PrevIndex = Images.length - 1;
        if (NextIndex > Images.length - 1) NextIndex = 0;
        NextOnClick = "_photoAlbums.a" + gallerySettings.PluginID + ".ChangeImage(" + NextIndex + ",this)";
        PrevOnClick = "_photoAlbums.a" + gallerySettings.PluginID + ".ChangeImage(" + PrevIndex + ",this)";
        var ImageOnload = "imageID=\"" + Image.ImageID + "\" ";
        ImageOnload = ImageOnload + "onload=\"_photoAlbums.a" + gallerySettings.PluginID + ".AdjustSize(); _photoAlbums.a" + gallerySettings.PluginID + ".SetLoaded('##THISDIVID##');\" ";
        var ThisImage = gallerySettings.HtmlItemTemplate;
        if (ThisImage.indexOf("<div style=\"display: none\"><img class=\"imagePreloader\" src=\"##IMAGEPATH##\"></div>")) {
            ThisImage = ThisImage.replace("class=\"imagePreloader\" ", "onload=\"_photoAlbums.a" + gallerySettings.PluginID + ".SetLoaded('##THISDIVID##');\" class=\"imagePreloader\" ");
        }
        if (Image.ImageUrl == "") ThisImage = ThisImage.replace(/##IMAGEURLLINK##/gi, "##IMAGE##");
        if (gallerySettings.ShowTooltip) {
            ThisImage = ThisImage.replace(/##IMAGE##/gi, "<img " + ImageOnload + "class=\"photoAlbumImage\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\" title=\"" + gallerySettings.TooltipValue + "\" ondblclick=\"window.open('" + gallerySettings.GetImagePath(Image.ImageID) + "')\">");
            ThisImage = ThisImage.replace(/##LIGHTBOXIMAGE##/gi, "<img " + ImageOnload + "style=\"cursor: pointer;\" class=\"photoAlbumImage\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\" title=\"" + gallerySettings.TooltipValue + "\" onclick=\"_photoAlbums.a" + gallerySettings.PluginID + ".LightBox(" + Image.ImageID + ")\">");
            ThisImage = ThisImage.replace(/##MAXIMAGE##/gi, "<img " + ImageOnload + "style=\"cursor: pointer;\" class=\"photoAlbumImage\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\" title=\"" + gallerySettings.TooltipValue + "\" onclick=\"window.open('" + gallerySettings.GetImagePath(Image.ImageID) + "')\">");
            ThisImage = ThisImage.replace(/##NOACTIONIMAGE##/gi, "<img " + ImageOnload + "class=\"photoAlbumImage\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\" title=\"" + gallerySettings.TooltipValue + "\">");
            ThisImage = ThisImage.replace(/##IMAGEURLLINK##/gi, "<a href=\"" + Image.ImageUrl + "\"><img " + ImageOnload + "class=\"photoAlbumImage\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\" title=\"" + gallerySettings.TooltipValue + "\" ondblclick=\"window.open('" + gallerySettings.GetImagePath(Image.ImageID) + "')\"></a>");
        } else {
            ThisImage = ThisImage.replace(/##IMAGE##/gi, "<img " + ImageOnload + "class=\"photoAlbumImage\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\" ondblclick=\"window.open('" + gallerySettings.GetImagePath(Image.ImageID) + "')\">");
            ThisImage = ThisImage.replace(/##LIGHTBOXIMAGE##/gi, "<img " + ImageOnload + "style=\"cursor: pointer;\" class=\"photoAlbumImage\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\" onclick=\"_photoAlbums.a" + gallerySettings.PluginID + ".LightBox(" + Image.ImageID + ")\">");
            ThisImage = ThisImage.replace(/##MAXIMAGE##/gi, "<img " + ImageOnload + "style=\"cursor: pointer;\" class=\"photoAlbumImage\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\" onclick=\"window.open('" + gallerySettings.GetImagePath(Image.ImageID) + "')\">");
            ThisImage = ThisImage.replace(/##NOACTIONIMAGE##/gi, "<img " + ImageOnload + "class=\"photoAlbumImage\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\">");
            ThisImage = ThisImage.replace(/##IMAGEURLLINK##/gi, "<a href=\"" + Image.ImageUrl + "\"><img " + ImageOnload + "class=\"photoAlbumImage\" border=\"0\" src=\"" + gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize + "\" ondblclick=\"window.open('" + gallerySettings.GetImagePath(Image.ImageID) + "')\"></a>");
        }
        ThisImage = ThisImage.replace(/##IMAGETITLE##/gi, Image.ImageName);
        ThisImage = ThisImage.replace(/##IMAGEDESC##/gi, Image.ImageLongDesc);
        if (Image.ImageUrl == null) {
            ThisImage = ThisImage.replace(/href=##IMAGEURL##/gi, "href=\"javascript:void(0);\"");
            ThisImage = ThisImage.replace(/href='##IMAGEURL##'/gi, "href=\"javascript:void(0);\"");
            ThisImage = ThisImage.replace(/href="##IMAGEURL##"/gi, "href=\"javascript:void(0);\"");
            ThisImage = ThisImage.replace(/##IMAGEURL##/gi, "");
        }
        ThisImage = ThisImage.replace(/##IMAGEURL##/gi, Image.ImageUrl);
        ThisImage = ThisImage.replace(/##IMAGEADDL1##/gi, Image.ImageCustom1);
        ThisImage = ThisImage.replace(/##IMAGEADDL2##/gi, Image.ImageCustom2);
        ThisImage = ThisImage.replace(/##IMAGEPATH##/gi, gallerySettings.GetImagePath(Image.ImageID) + gallerySettings.ImageSize);
        ThisImage = ThisImage.replace(/##PREVIOUSIMAGE##/gi, "<a class=\"prevImg" + PluginID + "\" href=\"javascript:void(0);\" onclick=\"" + PrevOnClick + "\">" + gallerySettings.UserScrollRevText + "</a>");
        ThisImage = ThisImage.replace(/##IMAGECOUNTER##/gi, "Image&nbsp;" + (ImageIndex + 1) + "&nbsp;of&nbsp;" + Images.length);
        ThisImage = ThisImage.replace(/##CURRENTIMAGENUMBER##/gi, (ImageIndex + 1));
        ThisImage = ThisImage.replace(/##TOTALIMAGESCOUNT##/gi, Images.length);
        ThisImage = ThisImage.replace(/##NEXTIMAGE##/gi, "<a class=\"nextImg" + PluginID + "\" href=\"javascript:void(0);\" onclick=\"" + NextOnClick + "\">" + gallerySettings.UserScrollFwdText + "</a>");
        ThisImage = ThisImage.replace(/##DIVIMAGEID##/gi, "##IMAGEID##");
        ThisImage = ThisImage.replace(/##IMAGEID##/gi, Image.ImageID);
        ThisImage = ThisImage.replace(/##INDEXID##/gi, ImageIndex);
        ThisImage = ThisImage.replace(/##CategoryID##/gi, CategoryID);
        if (ThisImage.indexOf("##IMAGEDROPDOWN##") !== -1) {
            var ImageDropString = "<select id=\"imageDrop_" + CategoryID + "_" + Image.ImageID + "\" onchange=\"_photoAlbums.a" + gallerySettings.PluginID + ".ChangeImageFromDrop(this);\" class=\"photoPlgImageDrop" + PluginID + "\">";
            $j.each(Images, function (key, OptionImage) {
                if (OptionImage.ImageID == Image.ImageID) {
                    ImageDropString = ImageDropString + "<option selected=\"true\" value=\"" + OptionImage.ImageID + "\">" + OptionImage.ImageName + "</option>";
                } else {
                    ImageDropString = ImageDropString + "<option value=\"" + OptionImage.ImageID + "\">" + OptionImage.ImageName + "</option>";
                }
            });
            ImageDropString = ImageDropString + "</select>";
            ThisImage = ThisImage.replace(/##IMAGEDROPDOWN##/gi, ImageDropString);
        }
        return ThisImage;
    };
    gallerySettings.SetTimerDrops = function () {
        if (gallerySettings.DisplayType === 5) return;
        $j(".photoPlgTimeDrop" + gallerySettings.PluginID).each(function () {
            $j(this).val(gallerySettings.DisplayImageTime);
        });
    };
    gallerySettings.SetCategoryDrops = function () {
        if (gallerySettings.DisplayType === 5) return;
        $j(".photoPlgCatDrop" + gallerySettings.PluginID).each(function () {
            $j(this).val(gallerySettings.Category);
        });
    };
    gallerySettings.TransitionIn = function (CurrentDivID, NewDivID, ChangeClass) {

        gallerySettings.Animated = true;
        if (gallerySettings.PreLoadTimer) window.clearTimeout(gallerySettings.PreLoadTimer);
        if ($j("#" + NewDivID).attr("isloaded") == "0" && gallerySettings.LoadCount < 10) {
            gallerySettings.PreLoadTimer = window.setTimeout("_photoAlbums.a" + gallerySettings.PluginID + ".TransitionIn(\"" + CurrentDivID + "\",\"" + NewDivID + "\",\"" + ChangeClass + "\");", 1000);
            gallerySettings.LoadCount = gallerySettings.LoadCount + 1;
            return;
        }
        gallerySettings.LoadCount = 0;
        $j("#divEmailPhoto" + gallerySettings.PluginID).hide();
        if (ChangeClass == "swipeRight") {
            var Show = CreateCustomTransition(2, 500, "direction: \"left\"");
            var Hide = CreateCustomTransition(2, 500, "direction: \"right\"");
            CustomTransition(Show, Hide, NewDivID, CurrentDivID, 0, "_photoAlbums.a" + gallerySettings.PluginID + ".TransitionComplete('" + NewDivID + "')");
        } else if (ChangeClass == "swipeLeft") {
            var Show = CreateCustomTransition(2, 500, "direction: \"right\"");
            var Hide = CreateCustomTransition(2, 500, "direction: \"left\"");
            CustomTransition(Show, Hide, NewDivID, CurrentDivID, 0, "_photoAlbums.a" + gallerySettings.PluginID + ".TransitionComplete('" + NewDivID + "')");
        } else if (gallerySettings.TransType == 23) {
            var CustomTransitionShowOptions = gallerySettings.CustomTransitionShowOptions;
            var CustomTransitionHideOptions = gallerySettings.CustomTransitionHideOptions;
            if (ChangeClass == "photoPlgCatDrop" + gallerySettings.PluginID && CustomTransitionShowOptions.indexOf("direction: \"user\"") != -1) CustomTransitionShowOptions = CustomTransitionShowOptions.replace("direction: \"user\"", "direction: \"up\"");
            if (ChangeClass == "photoPlgCatDrop" + gallerySettings.PluginID && CustomTransitionHideOptions.indexOf("direction: \"user\"") != -1) CustomTransitionHideOptions = CustomTransitionHideOptions.replace("direction: \"user\"", "direction: \"down\"");
            if (ChangeClass == "nextImg" + gallerySettings.PluginID && CustomTransitionShowOptions.indexOf("direction: \"user\"") != -1) CustomTransitionShowOptions = CustomTransitionShowOptions.replace("direction: \"user\"", "direction: \"right\"");
            if (ChangeClass == "nextImg" + gallerySettings.PluginID && CustomTransitionHideOptions.indexOf("direction: \"user\"") != -1) CustomTransitionHideOptions = CustomTransitionHideOptions.replace("direction: \"user\"", "direction: \"left\"");
            if (ChangeClass == "prevImg" + gallerySettings.PluginID && CustomTransitionShowOptions.indexOf("direction: \"user\"") != -1) CustomTransitionShowOptions = CustomTransitionShowOptions.replace("direction: \"user\"", "direction: \"left\"");
            if (ChangeClass == "prevImg" + gallerySettings.PluginID && CustomTransitionHideOptions.indexOf("direction: \"user\"") != -1) CustomTransitionHideOptions = CustomTransitionHideOptions.replace("direction: \"user\"", "direction: \"right\"");
            if (CustomTransitionShowOptions.indexOf("direction: \"user\"") != -1) CustomTransitionShowOptions = CustomTransitionShowOptions.replace("direction: \"user\"", "direction: \"right\"");
            if (CustomTransitionHideOptions.indexOf("direction: \"user\"") != -1) CustomTransitionHideOptions = CustomTransitionHideOptions.replace("direction: \"user\"", "direction: \"left\"");
            var Show = CreateCustomTransition(gallerySettings.CustomTransitionShowType, gallerySettings.CustomTransitionShowDuration, CustomTransitionShowOptions);
            var Hide = CreateCustomTransition(gallerySettings.CustomTransitionHideType, gallerySettings.CustomTransitionHideDuration, CustomTransitionHideOptions);
            CustomTransition(Show, Hide, NewDivID, CurrentDivID, gallerySettings.CustomTransitionOrder, "_photoAlbums.a" + gallerySettings.PluginID + ".TransitionComplete('" + NewDivID + "')");
        } else {
            DoTransition(gallerySettings.TransType, NewDivID, CurrentDivID, gallerySettings.TransitionDuration, "_photoAlbums.a" + gallerySettings.PluginID + ".TransitionComplete('" + NewDivID + "')");
        }
    };
    gallerySettings.TransitionComplete = function (NewDivID) {
        gallerySettings.StartRotation();
        gallerySettings.SetTimerDrops();
        gallerySettings.SetCategoryDrops();
        if (gallerySettings.DisplayType !== 5) {
            var Image = $j("#" + NewDivID).find(".photoAlbumImage");
            if (gallerySettings.EnableEmailPhoto) gallerySettings.EmailImageLink(Image);
            if ($j.browser.msie) $j(Image).css("display", "block");
        }
        gallerySettings.Animated = false;
        $j("#" + NewDivID).css("zIndex", "");
        gallerySettings.AfterImageChange(NewDivID);
    };
    gallerySettings.StopRotation = function () {
        window.clearTimeout(gallerySettings.Timer);
    };
    gallerySettings.StartRotation = function () {
        gallerySettings.AdjustSize();
        window.clearTimeout(gallerySettings.Timer);
        var NextIndex = (gallerySettings.CurrentIndex + 1);
        var PrevIndex = (gallerySettings.CurrentIndex - 1);
        if (NextIndex > gallerySettings.MaxIndex) NextIndex = 0;
        if (PrevIndex <= 0) PrevIndex = gallerySettings.MaxIndex;
        if (gallerySettings.DisplayType === 1) return;
        if (gallerySettings.DisplayImageTime > 0 && gallerySettings.MaxIndex > 0) gallerySettings.Timer = window.setTimeout("_photoAlbums.a" + gallerySettings.PluginID + ".ChangeImage(" + NextIndex + ");", gallerySettings.DisplayImageTime);
        if (gallerySettings.DisplayType === 5) {
            if (gallerySettings.WrapPages) {
            }
            gallerySettings.LoadPageDiv(NextIndex);
            gallerySettings.LoadPageDiv(PrevIndex);
            $j("#imageCounter" + gallerySettings.PluginID).html("Page&nbsp;" + (gallerySettings.CurrentIndex + 1) + "&nbsp;of&nbsp;" + (gallerySettings.MaxIndex + 1));
            $j("#currentImageNumber" + gallerySettings.PluginID).html(gallerySettings.CurrentIndex + 1);
            $j("#totalImagesCount" + gallerySettings.PluginID).html(gallerySettings.MaxIndex + 1);
        } else {
            gallerySettings.LoadImageDiv(NextIndex);
            gallerySettings.LoadImageDiv(PrevIndex);
        }
    };
    gallerySettings.AdjustSize = function () {
        $j("#photoPluginWrapper" + gallerySettings.PluginID).height($j("#" + gallerySettings.CurrentDivID).height());
        $j("#photoPluginWrapper" + gallerySettings.PluginID).width($j("#" + gallerySettings.CurrentDivID).width());
    };
    gallerySettings.MoveEmailImage = function (ImageObjID) {
        var offset = $j("#" + ImageObjID).offset();
        var EmailDiv = document.getElementById("divEmailPhoto" + gallerySettings.PluginID);
        if (offset && EmailDiv) {
            EmailDiv.style.top = offset.top;
            EmailDiv.style.left = offset.left;
            gallerySettings.EmailImageID = $j("#" + ImageObjID).attr("imageID");
        }
    };
    gallerySettings.EmailImageLink = function (imageObj) {
        var offset = $j(imageObj).position();
        if (offset && gallerySettings.EmailPhotoDiv) {
            gallerySettings.EmailPhotoDiv.css("top", offset.top);
            gallerySettings.EmailPhotoDiv.css("left", offset.left);
            gallerySettings.EmailPhotoDiv.show('fade', 100);
            gallerySettings.EmailImageID = $j(imageObj).attr("imageID");
        }
    };
    gallerySettings.EmailImage = function () {
        gallerySettings.StopRotation();
        showAxisDialog("photoPlugSettings" + gallerySettings.PluginID, {
            onClose: function (dialogBox) { gallerySettings.StartRotation(); },
            href: gallerySettings.EmailLink.replace("default.aspx", "dialog.aspx") + "&imageid=" + gallerySettings.EmailImageID,
            height: 400,
            width: 600,
            title: "Email Photo"
        });
    };
    gallerySettings.LightBox = function (ImageID) {
        gallerySettings.StopRotation();
        if (!gallerySettings.lightboxDiv) {
            gallerySettings.lightboxDiv = $j("<div/>").mousemove(function () { gallerySettings.ShowControls(); }).addClass("lightBoxDiv").attr("id", "lightBox" + gallerySettings.PluginID + "Div").appendTo("body");
            $j("<img/>").addClass("lightBoxImg").load(function () { if (!gallerySettings.LoadingAsMobile) gallerySettings.DelayImageDisplay() }).attr("id", "lightBox" + gallerySettings.PluginID + "Img").attr("align", "absmiddle").attr("border", "0").css("display", "block").appendTo(gallerySettings.lightboxDiv);
            var toolbar = $j("<div/>").attr("id", "lightBox" + gallerySettings.PluginID + "Toolbar").addClass("lightBoxToolbar").appendTo(gallerySettings.lightboxDiv);
            if (gallerySettings.LoadingAsMobile || gallerySettings.IsMobileBrowser) {
                gallerySettings.lightboxDiv.addClass("mobileSploder");
                try {
                    gallerySettings.lightboxDiv.swipe({
                        swipingLeft: function () {
                            gallerySettings.ChangeLBImage(1);
                        },
                        swipingRight: function () {
                            gallerySettings.ChangeLBImage(-1);
                        }
                    });
                } catch (e) {
                }
            } else {
                $j("<div/>").html("&laquo;&nbsp;Prev").click(function () { gallerySettings.ChangeLBImage(-1) }).attr("id", "lightBox" + gallerySettings.PluginID + "PrevDiv").addClass("lightBoxPrevDiv").appendTo(gallerySettings.lightboxDiv);
                $j("<div/>").html("Next&nbsp;&raquo;").click(function () { gallerySettings.ChangeLBImage(1) }).attr("id", "lightBox" + gallerySettings.PluginID + "NextDiv").addClass("lightBoxNextDiv").appendTo(gallerySettings.lightboxDiv);
                ($j.browser.msie) ? toolbar.css("position", "absolute").css("bottom", "5px").css("margin-left", "5px").width("100%") : toolbar.css("margin", "-32px 10px 0");
            }
            $j("<div/>").html("<span id=\"lightBox" + gallerySettings.PluginID + "TitleSpan\">X / X images</span>").attr("id", "lightBox" + gallerySettings.PluginID + "TitleDiv").addClass("lightBoxTitleDiv").appendTo(toolbar);
            $j("<div/>").html("Close X").click(function () { gallerySettings.CloseLightBox(); gallerySettings.StartRotation(); }).attr("id", "lightBox" + gallerySettings.PluginID + "CloseDiv").addClass("lightBoxCloseDiv").appendTo(toolbar);
        }
        if (!gallerySettings.LoadingAsMobile) {
            if ($j("#lightBoxLoadDiv").length === 0) {
                $j("<div/>").addClass("lightBoxLoadDiv").attr("id", "lightBoxLoadDiv").html("<img src=\"" + gallerySettings.SiteDomainPath + "/A_master/library/css/sploders/img/FusionLoading.gif\" />").appendTo("body");
            }
            if (gallerySettings.lightboxDiv.css("visibility") == "hidden") enableDiv("lightBoxLoadDiv", 50, 50, "true", "true");
            $j("#grayOutDiv").click(function () { gallerySettings.CloseLightBox(); });
        } else {
            enableDiv("lightBox" + gallerySettings.PluginID + "Div", 0, 0, "true", "true");
            gallerySettings.ShowControls();
            gallerySettings.SetHeight();
        }
        var newSource = gallerySettings.GetImagePath(ImageID) + "&maxheight=" + ($j(window).height() - 35) + "&maxwidth=" + ($j(window).width() - 35);
        if ($j("#lightBox" + gallerySettings.PluginID + "Img").attr("src") === newSource) gallerySettings.DelayImageDisplay();
        $j("#lightBox" + gallerySettings.PluginID + "Img").attr("src", newSource);
        gallerySettings.SetCount(ImageID);
    };
    gallerySettings.DelayImageDisplay = function () {
        disableDiv("lightBoxLoadDiv");
        $j("#lightBox" + gallerySettings.PluginID + "Div").show();
        enableDiv("lightBox" + gallerySettings.PluginID + "Div", $j("#lightBox" + gallerySettings.PluginID + "Img").height(), $j("#lightBox" + gallerySettings.PluginID + "Img").width(), "true", "true");
        $j("#lightBox" + gallerySettings.PluginID + "Div").hide();
        $j("#lightBox" + gallerySettings.PluginID + "Div").show("fade", 200);
        gallerySettings.ShowControls();
    };
    gallerySettings.CloseLightBox = function () {
        $j("#grayOutDiv").unbind("click");
        disableDiv("lightBox" + gallerySettings.PluginID + "Div"); 
        gallerySettings.LightboxIndex = -1;
    };
    gallerySettings.ShowControls = function () {
        window.clearTimeout(gallerySettings.HideControlsTimer);
        var lbImages;
        if (gallerySettings.Categories.length == 1 || !gallerySettings.ShowCatDrop || gallerySettings.Category == 0) {
            lbImages = gallerySettings.OrderedImages;
        } else {
            lbImages = gallerySettings.GetCategory(gallerySettings.Category).CategoryImages;
        }
        if (lbImages.length > 1) {
            $j("#lightBox" + gallerySettings.PluginID + "PrevDiv").show();
            $j("#lightBox" + gallerySettings.PluginID + "NextDiv").show();
        }
        $j("#lightBox" + gallerySettings.PluginID + "Toolbar").show();
        gallerySettings.HideControlsTimer = window.setTimeout("_photoAlbums.a" + gallerySettings.PluginID + ".HideControls();", (gallerySettings.LoadingAsMobile) ? 5000 : 2000);
    };
    gallerySettings.HideControls = function () {
        window.clearTimeout(gallerySettings.HideControlsTimer);
        $j("#lightBox" + gallerySettings.PluginID + "PrevDiv").hide("fade", 200, function () {
            $j(this).css("filter", "progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=75);");
        });
        $j("#lightBox" + gallerySettings.PluginID + "NextDiv").hide("fade", 200, function () {
            $j(this).css("filter", "progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=75);");
        });
        if ($j.browser.msie) {
            $j("#lightBox" + gallerySettings.PluginID + "Toolbar").hide("fade", 200, function () { $j(this).css("filter", "progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=75);"); });
        } else {
            $j("#lightBox" + gallerySettings.PluginID + "Toolbar").slideUp();
        }
    };
    gallerySettings.SetCount = function (ImageID) {
        var lbImages;
        if (gallerySettings.Categories.length == 1 || !gallerySettings.ShowCatDrop || gallerySettings.Category == 0) {
            lbImages = gallerySettings.OrderedImages;
        } else {
            lbImages = gallerySettings.GetCategory(gallerySettings.Category).CategoryImages;
        } 
        if (gallerySettings.LightboxIndex === -1) {
            for (var i = 0; i < lbImages.length; i++) {
                if (lbImages[i].ImageID === ImageID) gallerySettings.LightboxIndex = i;
            }
        }
        $j("#lightBox" + gallerySettings.PluginID + "TitleSpan").html((gallerySettings.LightboxIndex + 1) + " / " + lbImages.length + " images");
    };
    gallerySettings.SetHeight = function () {
        $j("#lightBox" + gallerySettings.PluginID + "Div").css("height", getCookie("screenHeight"));
        $j("#lightBox" + gallerySettings.PluginID + "Div").css("width", getCookie("screenWidth"));
        window.scrollTo(0, 0);
    };
    gallerySettings.ChangeLBImage = function (Direction) {
        if (gallerySettings.LoadingAsMobile) gallerySettings.SetHeight();
        gallerySettings.ShowControls();
        var lbImages;
        if (gallerySettings.Categories.length == 1 || !gallerySettings.ShowCatDrop || gallerySettings.Category == 0) {
            lbImages = gallerySettings.OrderedImages;
        } else {
            lbImages = gallerySettings.GetCategory(gallerySettings.Category).CategoryImages;
        }
        var DisplayedImageID = lbImages[gallerySettings.LightboxIndex].ImageID;
        gallerySettings.LightboxIndex = gallerySettings.LightboxIndex + Direction;
        if (gallerySettings.LightboxIndex === lbImages.length) gallerySettings.LightboxIndex = 0;
        if (gallerySettings.LightboxIndex < 0) gallerySettings.LightboxIndex = lbImages.length - 1;
        var Src = $j("#lightBox" + gallerySettings.PluginID + "Img").attr("src");
        Src = Src.replace("ID=" + DisplayedImageID, "ID=" + lbImages[gallerySettings.LightboxIndex].ImageID);
        $j("#lightBox" + gallerySettings.PluginID + "Img").attr("src", Src);
        gallerySettings.SetCount(0);
        if (!gallerySettings.LoadingAsMobile) {
            disableDiv("lightBox" + gallerySettings.PluginID + "Div");
            enableDiv("lightBoxLoadDiv", 50, 50, "true", "true");
        }
    };
    try {
        if (gallerySettings.LoadingAsMobile || gallerySettings.IsMobileBrowser) {
            if (gallerySettings.DisplayType === 2 || gallerySettings.DisplayType === 3) {
                $j('#photoPluginWrapper' + gallerySettings.PluginID).touchwipe({
                    wipeLeft: function () {
                        var Index = (gallerySettings.CurrentIndex + 1);
                        if (Index > gallerySettings.MaxIndex) Index = 0;
                        gallerySettings.ChangeImage(Index, null, 'swipeLeft');
                    },
                    wipeRight: function () {
                        var Index = (gallerySettings.CurrentIndex - 1);
                        if (Index < 0) Index = gallerySettings.MaxIndex;
                        gallerySettings.ChangeImage(Index, null, 'swipeRight');
                    },
					preventDefaultEvents: false
                });
            } else if (gallerySettings.DisplayType === 5) {
                $j('#photoPluginWrapper' + gallerySettings.PluginID).touchwipe({
                    wipeLeft: function () {
                        gallerySettings.ChangePage(1, null, 'swipeLeft');
                    },
                    wipeRight: function () {
                        gallerySettings.ChangePage(-1, null, 'swipeRight');
                    },
					preventDefaultEvents: false
                });
            }
        }
    } catch (e) {
    }
    gallerySettings.Category = gallerySettings.InitialSelectedCategory;
    gallerySettings.SetMaxIndex();
    if (gallerySettings.DisplayType === 5) gallerySettings.InitCarousel();
    if (gallerySettings.DisplayType === 5) {
        gallerySettings.CurrentDivID = gallerySettings.LoadPageDiv(0);
    } else {
        var startIndex = (gallerySettings.DisplayType === 1) ? Math.floor(Math.random() * ((gallerySettings.OrderedImages.length - 1) - 0 + 1)) + 0 : 0;
        gallerySettings.CurrentDivID = gallerySettings.LoadImageDiv(startIndex);
    }
    $j("#" + gallerySettings.CurrentDivID).show();
    var Image = $j("#" + gallerySettings.CurrentDivID).find(".photoAlbumImage");
    if (gallerySettings.EnableEmailPhoto) gallerySettings.EmailImageLink(Image);
    if (gallerySettings.DisplayType === 1) gallerySettings.DisplayImageTime = 0;
    gallerySettings.StartRotation();
    gallerySettings.PluginLoadFinished();
    if (gallerySettings.DisplayType === 2 || gallerySettings.DisplayType === 3) {
        if (gallerySettings.PreloadAllFrames) {
            if (gallerySettings.InitialSelectedCategory === 0) {
                $j.each(gallerySettings.OrderedImages, function (key, Image) {
                    gallerySettings.LoadImageDiv(key); 
                });
            } else {
                $j.each(gallerySettings.Categories, function (key, Category) {
                    $j.each(Category.CategoryImages, function (key, Image) {
                        gallerySettings.LoadImageDiv(key, Category.CategoryID);
                    })
                });
            }
        } else if (gallerySettings.ShowCatDrop) {
            $j.each(gallerySettings.Categories, function (key, Category) {
                if (Category.CategoryID !== gallerySettings.InitialSelectedCategory) {
                    gallerySettings.LoadImageDiv(0, Category.CategoryID);
                }
            });
        }
    }
    gallerySettings.IsLoaded = true;
}