<!DOCTYPE html>
<head>
	<meta charset="UTF-8"/>
	<meta name="author" content="We Are Fellows"/>
	<meta name="description" content="">
	<meta name="keywords" content="">
	<meta name="robots" content="index, follow">

	<meta name="viewport" content="width=device-width,initial-scale=1.0">
	
	<title>M A R K</title>
	
	<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
	<script src="http://dev.electricgecko.de/mark/masonry.js"></script>
	
	<script type="text/javascript">
		
		$(window).load(function(){	
			$('main').masonry({
				itemSelector: 'li',
				columnWidth: 60,
				gutter: 0
			});	
			
		});
	</script>
	
	<style>
		
		main {
			margin: 3% auto;
			width: 95%;
		}
		
		ul {
			list-style: none;
		}
		
		li {
			width: 250px;
			margin-bottom: 20px;
			
			font-size: 9px;
			font-family: 'Arial', sans-serif;
			letter-spacing: 1px;
		}		
		
		figure {
			margin: 0;
			padding: 0;
			
		}
	
		
		figure > a:hover:after {
			content: ' ';
			display: block;
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;
		
			background: rgba(255, 230, 0, 0.5)
		}
		
			
		
		span {
			display: block;
		}
		
		img {
			display: block;
			width: 100%;
			height: auto;
		}	
		
	</style>
</head>

<body>
	
	<main>
		
		<ul>

		<?php
			$dirname = "imgs/";
			$images = glob($dirname."*.jpg");
		
		
			foreach($images as $image) {
				
			// read image info from filename
			
				$img_info = explode("-", basename($image));
				
				$image_date = $img_info[0];
				$image_w = $img_info[1];
				$image_h = $img_info[2];	
				$image_title = $img_info[3];
		
				
				echo '<li><figure><a href="'.$image.'"><img width="'.$image_w.'" height="'.$image_h.'" src="'.$image.'" /></a></figure></li>';
			}
		
		?>
		
		</ul>

	</main>

</body>