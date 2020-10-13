document.addEventListener("DOMContentLoaded", function () {
	//Observe and fire when Dashboard is initialized and ready.
	console.log('content loaded');
	var observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			if (mutation.attributeName === "class") {
				if ($(mutation.target).hasClass('screenshot_status_ready')) {
					if (typeof zd != 'undefined'
						&& typeof zd.dashboardView != 'undefined'
						&& typeof zd.dashboardView._controls != 'undefined') {
						observer.disconnect();
						const constantMock = window.fetch;
						window.fetch = function () {
							return new Promise((resolve, reject) => {
								constantMock.apply(this, arguments)
									.then((response) => {
										if (response.url.indexOf('/api/actions/') > -1 && response.url.indexOf('/invoke') > -1) {
											var fltr = JSON.parse(arguments[1].body).startVisMessage.filters[0];
											var actionLabel = fltr.path.name + '-';
											actionLabel += fltr.value[0];
											parent.postMessage('action_invoked:' + actionLabel.replace(/\s/g, ''), '*');
											console.log(fltr);
										}
										resolve(response);
									})
									.catch((error) => {
										reject(response);
									})
							});
						}
					}
				}
			}
		});
	});
	observer.observe(document.body, {
		attributes: true
	});
	if (document.getElementById('zoomdata-init-loader') !== null) {
		observer.observe(document.getElementById('zoomdata-init-loader'), {
			attributes: true
		});
	}
});