@extends('emails.layouts.master')

@section('content')
  {!! $customBodyHtml ?? '' !!}
@endsection
