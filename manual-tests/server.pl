#!/usr/bin/env perl

=head1 DESCRIPTION

An extremely minimal webserver written in that be used to test OpenLayers plugin.

=cut

use FindBin;

use strict;
use warnings;
use LWP::Simple;
use Plack::Request;
use Plack::MIME;
use File::Basename;
use File::Spec;
use Encode;

my $app = sub {
    my $env = shift;

    my $req = Plack::Request->new($env);

    my $content;
    my $content_type;
    if( $req->path_info() eq '/proxy'){

        my $url = $req->param('url');
        die "Missing url parameter" if !$url;

        $content_type = 'application/xml';
        $content = get($url);
        $content = encode_utf8($content)
    } else {

        my $filename = File::Spec->catfile($FindBin::Bin, $req->path_info() );

        # nice little hack that also checks one directory up
        if( !( -e $filename ) ){
        	$filename = File::Spec->catfile($FindBin::Bin, '..', $req->path_info() );
        }

        my (undef, undef, $suffix) = fileparse($filename, qr/\.[^.]*/);

        my %binary_files = (
            '.png' => 1,
        );

        open my $FH, '<', $filename or die "Could not open '$filename': $!";
        if( exists $binary_files{ $suffix } ){

            binmode $FH;
        }

        $content = do { local $/; <$FH> };
        close $FH;

        $content_type = Plack::MIME->mime_type($suffix);

    }


    return [ 200, ['Content-Type', $content_type], [$content]];
};