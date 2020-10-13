document.addEventListener("DOMContentLoaded", function () {
    /* observe changes to target, i.e. body, and look for dashboard listing */
    var observer = new MutationObserver(function (mutations) {

        /* select dashboard listing */
        librarylisting = document.querySelectorAll(".zdView-TableView .ag-center-cols-container .ag-row");
        if (librarylisting.length > 0) {

            /* array of users and authors who should have dashboard permissions access */
            if (window.userswithpermission == null) {
                window.userswithpermission = [
                    window.logi.user.attributes.name, /* current user is author */
                    'fellow_author_who_can_manage_my_content' /* possible to populate list dynamically, e.g. using APIs */
                ];
            }

            librarylisting.forEach(function (row) {
                if (row.children.length > 0) {
                    let author = row.querySelector('div:nth-child(4)').title;

                    /* hide permissions control if author is not in above array or a user administrator */
                    if (!window.userswithpermission.includes(author) && !window.logi.user.permissions.users.administer) {
                        row.querySelector('div:nth-child(6)').style.display = "none";
                    };
                };
            });
        };

    });

    var target = document.body;
    observer.observe(target, { childList: true, subtree: true });

});
