$(function() {
	const instagramId = '17841472010071359';
	const accessToken = 'EAANZAA3SEGOMBO8Mlftoif4n55ks1mHCkXstz1QDY4lHbMZAZALUa85fgnLOKxCCG00xoqlffSiVwF0G0ST4nymalnNKqkH9RmB4WvEBdQAz9ZBZBuHLKgs5ZA8KZBAwIIDoaiKezfKOsCRAJlc69ekfWy77K2WOIci8rN24KjXEhLMqcGzIgpHZCw6FDmPCnwB0';
	const limit = 6; // 表示する投稿数

	// APIエンドポイントを修正
	const apiUrl = `https://graph.facebook.com/v18.0/${instagramId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url&access_token=${accessToken}&limit=${limit}`;

	console.log('Fetching Instagram feed...'); // デバッグ用

	$.ajax({
		url: apiUrl,
		type: 'GET',
		dataType: 'json',
		success: function(response) {
			console.log('API Response:', response); // デバッグ用

			if (response.data && response.data.length > 0) {
				const $instaList = $('.insta_list');
				$instaList.empty(); // 既存のコンテンツをクリア

				response.data.forEach(function(post, index) {
					console.log(`Processing post ${index + 1}:`, post); // デバッグ用

					const mediaUrl = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;
					const caption = post.caption ? post.caption : '';
					
					if (mediaUrl) {
						const $li = $('<li>').append(
							$('<a>', {
								href: post.permalink,
								target: '_blank',
								rel: 'noopener noreferrer'
							}).append(
								$('<img>', {
									src: mediaUrl,
									alt: caption,
									loading: 'lazy'
								})
							)
						);

						$instaList.append($li);
					} else {
						console.warn(`No media URL for post ${index + 1}`); // デバッグ用
					}
				});

				// Instagram buttonのリンクを更新
				$('.instagram-button').attr('href', 'https://www.instagram.com/skyhacker_jp/');
				
				console.log('Instagram feed loaded successfully'); // デバッグ用
			} else {
				console.warn('No Instagram posts found in response'); // デバッグ用
				// エラー時のフォールバック表示
				showFallbackContent();
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.error('Instagram feed error:', {
				status: jqXHR.status,
				textStatus: textStatus,
				errorThrown: errorThrown,
				responseText: jqXHR.responseText
			});
			// エラー時のフォールバック表示
			showFallbackContent();
		}
	});

	// フォールバックコンテンツを表示する関数
	function showFallbackContent() {
		const $instaList = $('.insta_list');
		$instaList.empty();
		
		// フォールバック用の画像を6枚表示
		for (let i = 0; i < 6; i++) {
			const $li = $('<li>').append(
				$('<a>', {
					href: 'https://www.instagram.com/skyhacker_jp/',
					target: '_blank',
					rel: 'noopener noreferrer'
				}).append(
					$('<img>', {
						src: `media/instagram_fallback_${i + 1}.jpg`, // フォールバック用の画像
						alt: 'Instagram post',
						loading: 'lazy'
					})
				)
			);
			$instaList.append($li);
		}
	}
});